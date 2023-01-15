// @ts-ignore
import {VideoStream} from "./videoStream";
import {createFolder} from "./fileUtils";
import {Config} from "./config";

const init = () => {
    createFolder(Config.dataDir);
    createFolder(Config.screenshotsDir);
    createFolder(Config.videoDir);

    // @ts-ignore
    new VideoStream({
        name: 'camera1',
        streamUrl: 'rtsp://10.0.0.1:7447/zlFbL8rgFImEfUVF',
        wsPort: 3001,
        ffmpegOptions: {
            '-stats': '',
            '-r': 30
        }
    });
}

export { init };