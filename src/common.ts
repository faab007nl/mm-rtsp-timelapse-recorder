import {createFolder} from "./fileUtils";
import {Config} from "./config";
import {VideoStream} from "./videoStream";

const init = () => {
    createFolder(Config.dataDir);
    createFolder(Config.screenshotsDir);
    createFolder(Config.videoDir);

    let stream1 = new VideoStream({
        name: 'camera1',
        url: 'rtsp://10.0.0.1:7447/zlFbL8rgFImEfUVF',
        wsPort: 3001,
        ffmepgOptions: {
            '-stats': '',
            '-r': 30
        }
    });
    stream1.on('camdata', (data: any) => {
        //console.log("got camera data");
    });

    let stream2 = new VideoStream({
        name: 'camera2',
        url: 'rtsp://10.0.0.1:7447/CUaxoTjcEK8XpbMp',
        wsPort: 3002,
        ffmepgOptions: {
            '-stats': '',
            '-r': 30
        }
    });
    stream2.on('camdata', (data: any) => {
        //console.log("got camera data");
    });
}

export { init };