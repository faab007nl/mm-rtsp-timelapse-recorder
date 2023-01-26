import {ActiveCameraStreams, CameraFeed, Recording} from "./include/interfaces";
import {VideoStream} from "./videoStream";
import {RecordingStatus} from "./include/enums";
import {getCameraFeed, getSetting, insertRecording, updateRecordingDuration} from "./sql";
import {startCameraCapture, stopCameraCapture} from "./videoStream/rtspStreamManager";
import {v4} from "uuid";

let maxRecordingDuration = 0;
let activeCameraStreams: ActiveCameraStreams = {};
let recordingStatus: RecordingStatus = RecordingStatus.STOPPED;
let recordingTimeout: NodeJS.Timeout|null = null;
let recordingDuration = 0;
let lastCameraScreenshot: any = {};
let activeRecording: Recording|null = null;

export const initCameraManager = async () => {
    const max_recording_duration = await getSetting('max_recording_duration') ?? { value: 0 };
    maxRecordingDuration = parseInt(`${max_recording_duration.value}`) * 60;
}

export const activateCamera = (cameraFeed: CameraFeed, errorCallback: any) => {
    if(cameraFeed === undefined || cameraFeed === null) return;
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
    lastCameraScreenshot[cameraFeed.id] = data;
}

export const getRecordingStatus = (): RecordingStatus => {
    return recordingStatus;
}

export const getRecordingDuration = (): number => {
    return recordingDuration;
}

export const startRecording = async () => {
    recordingStatus = RecordingStatus.RECORDING;
    recordingDuration = 0;

    const recording: Recording = {
        id: -1,
        uid: v4(),
        duration: 0,
        datetime: Date.now()
    };
    recording.id = await insertRecording(recording);

    activeRecording = recording;

    for (const [key, value] of Object.entries(activeCameraStreams)) {
        let cameraFeedId = parseInt(key);
        let cameraFeed = await getCameraFeed(cameraFeedId);
        if(cameraFeed === null) continue;

        startCameraCapture(cameraFeed, recording);
    }

    recordingTimeout = setInterval(() => {
        recordingDuration++;
        if (recordingDuration >= maxRecordingDuration) {
            console.log("Custom max recording duration reached")
            stopRecording();
        }
        if (recordingDuration >= 43200) {
            console.log("Max recording duration reached")
            stopRecording();
        }
        if (activeRecording === null) return;

        activeRecording.duration = recordingDuration;
        updateRecordingDuration(activeRecording);
    }, 1000);
}

export const stopRecording = async () => {
    recordingStatus = RecordingStatus.STOPPED;
    recordingDuration = 0;

    for (const [key, value] of Object.entries(activeCameraStreams)) {
        let cameraFeedId = parseInt(key);
        let cameraFeed = await getCameraFeed(cameraFeedId);
        if(cameraFeed === null) continue;

        stopCameraCapture(cameraFeed);
    }

    if(recordingTimeout){
        clearInterval(recordingTimeout);
        recordingTimeout = null;
    }
}