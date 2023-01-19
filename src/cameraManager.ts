import {ActiveCameraStreams, CameraFeed} from "./include/interfaces";
import {VideoStream} from "./videoStream";

let activeCameraStreams: ActiveCameraStreams = {};

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
            console.log("got camera data");
            console.log(data);
        });
        cameraStream.on('streamTimedOut', (data: any) => {
            deactivateCamera(cameraFeed);
            errorCallback( {
                message: "Stream timed out",
            }, "timeout");
        });
        cameraStream.on('exitWithError', (data: any) => {
            console.log("", "event error", data);
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

export const cameraStreamActive = (cameraFeed: CameraFeed): boolean => {
    return activeCameraStreams[cameraFeed.id] !== undefined && activeCameraStreams[cameraFeed.id] !== null;
}