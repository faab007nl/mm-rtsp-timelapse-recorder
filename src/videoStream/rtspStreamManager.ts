import {CameraFeed, Recording} from "../include/interfaces";
import * as child_process from "child_process";
import {getSetting} from "../sql";
import {v4} from "uuid";
import {createFolder, getFilesCount, readDir} from "../fileUtils";

let activeCameraStreams: any = {};

export const startCameraCapture = (cameraFeed: CameraFeed, recording: Recording) => {
    if(cameraFeed === undefined || cameraFeed === null) return;

    createFolder(`data/screenshots/${recording.name}/${cameraFeed.name}/`);

    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) {
        let process = child_process.spawn("ffmpeg", [
            "-rtsp_transport",
            "tcp",
            "-i",
            cameraFeed.url,
            "-vf",
            `fps=1/${cameraFeed.interval}`,
            `data/screenshots/${recording.name}/${cameraFeed.name}/img%03d.jpg`
        ], {
            detached: false,
        });
        activeCameraStreams[cameraFeed.id] = {
            id: cameraFeed.id,
            process: process
        };
    }
}

export const stopCameraCapture = (cameraFeed: CameraFeed) => {
    if(cameraFeed === undefined || cameraFeed === null) return;
    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) return;

    let process = activeCameraStreams[cameraFeed.id].process;
    process.kill();
    delete activeCameraStreams[cameraFeed.id];
}

export const convertScreenshotsToVideo = async (cameraFeed: CameraFeed, recording: Recording) => {
    if(cameraFeed === undefined || cameraFeed === null) return;
    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) return;
    const export_fps = parseInt(`${(await getSetting('export_fps') ?? { value: 24 }).value}`);
    const imageFolder = `data/screenshots/${recording.name}/${cameraFeed.name}/`;
    const videoFolder = `data/videos/${recording.name}/${cameraFeed.name}/`;
    createFolder(videoFolder);

    const imageCount = getFilesCount(`${imageFolder}`);
    const finalVideoDuration = imageCount / export_fps;

    let process = child_process.spawn("ffmpeg", [
        "-framerate",
        `${export_fps}`,
        "-i",
        `data/screenshots/${recording.name}/${cameraFeed.name}/img%03d.jpg`,
        "-c:v",
        "libx264",
        "-r",
        "30",
        "-pix_fmt",
        "yuv420p",
        `data/videos/${recording.name}/${cameraFeed.name}/timelapse.mp4`
    ], {
        detached: false,
    });
    process.stderr.on('data', (data) => {
        let content = data.toString();
        if(content.includes("time=")) {
            let time = content.split("time=")[1].split(" ")[0];
            let timeSplit = time.split(":");
            let timeInSeconds = parseFloat(timeSplit[0]) * 3600 + parseFloat(timeSplit[1]) * 60 + parseFloat(timeSplit[2]);
            let progress = timeInSeconds / finalVideoDuration;


        }
    });
    process.on('exit', (code) => {

    });
}

// ffmpeg -framerate 24 -i img%03d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p test.mp4