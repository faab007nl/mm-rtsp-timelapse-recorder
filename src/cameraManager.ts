import {ActiveCameraStreams, CameraFeed} from "./include/interfaces";
import {VideoStream} from "./videoStream";
import {RecordingStatus} from "./include/enums";
import {getSetting} from "./sql";

let maxRecordingDuration = 0;
let activeCameraStreams: ActiveCameraStreams = {};
let recordingStatus: RecordingStatus = RecordingStatus.STOPPED;
let recordingTimeout: NodeJS.Timeout|null = null;
let recordingDuration = 0;

export const initCameraManager = async () => {
    const max_recording_duration = await getSetting('max_recording_duration') ?? { value: 0 };
    maxRecordingDuration = parseInt(`${max_recording_duration.value}`) * 60;
}

export const activateCamera = (cameraFeed: CameraFeed, errorCallback: any) => {
    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) {
        let cameraStream = new VideoStream({
            name: cameraFeed.name,
            url: cameraFeed.url,
            wsPort: cameraFeed.wsPort,
            ffmepgOptions: {
                '-stats': '',
                '-r': 30
            },
            autoStart: true
        });

        cameraStream.on('camdata', (data: any) => {
            handleCameraData(cameraFeed, data);
        });
        cameraStream.on('streamTimedOut', (data: any) => {
            deactivateCamera(cameraFeed);
            errorCallback( {
                message: "Stream timed out",
            });
        });
        cameraStream.on('exitWithError', (data: any) => {
            deactivateCamera(cameraFeed);
            errorCallback(data);
        });

        activeCameraStreams[cameraFeed.id] = {
            id: cameraFeed.id,
            wsPort: cameraFeed.wsPort,
            stream: cameraStream
        };
    }

}

export const deactivateCamera = (cameraFeed: CameraFeed) => {
    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) return;

    let stream = activeCameraStreams[cameraFeed.id].stream;

    stream.stop();
    delete activeCameraStreams[cameraFeed.id];
}

export const getActiveCameraStreams = (): ActiveCameraStreams => {
    return activeCameraStreams;
}

export const getActiveCameraStreamsCount = (): number => {
    return Object.keys(activeCameraStreams).length
}

export const cameraStreamActive = (cameraFeed: CameraFeed): boolean => {
    return activeCameraStreams[cameraFeed.id] !== undefined && activeCameraStreams[cameraFeed.id] !== null;
}

const handleCameraData = (cameraFeed: CameraFeed, data: any) => {
    if(recordingStatus !== RecordingStatus.RECORDING) return;

    if(recordingDuration >= maxRecordingDuration){
        stopRecording();
        return;
    }

    if (recordingDuration % cameraFeed.interval === 0) {
        console.log("Take Screenshot");
    }

    //console.log("Recording: ", cameraFeed.name);
}

export const getRecordingStatus = (): RecordingStatus => {
    return recordingStatus;
}

export const getRecordingDuration = (): number => {
    return recordingDuration;
}

export const startRecording = () => {
    recordingStatus = RecordingStatus.RECORDING;
    recordingDuration = 0;
    recordingTimeout = setInterval(() => {
        recordingDuration++;
        if(recordingDuration >= maxRecordingDuration){
            stopRecording();
        }
    }, 1000);
}

export const stopRecording = () => {
    recordingStatus = RecordingStatus.STOPPED;
    recordingDuration = 0;

    if(recordingTimeout){
        clearInterval(recordingTimeout);
        recordingTimeout = null;
    }
}