import {CameraFeed, Recording} from "../include/interfaces";
import * as child_process from "child_process";
import {getSetting} from "../sql";
import {v4} from "uuid";
import {createFolder} from "../fileUtils";

let activeCameraStreams: any = {};

export const startCameraCapture = (cameraFeed: CameraFeed, recording: Recording) => {
    if(cameraFeed === undefined || cameraFeed === null) return;

    createFolder(`data/screenshots/${recording.name}/`);

    if (activeCameraStreams[cameraFeed.id] === undefined || activeCameraStreams[cameraFeed.id] === null) {
        let process = child_process.spawn("ffmpeg", [
            "-rtsp_transport",
            "tcp",
            "-i",
            cameraFeed.url,
            "-vf",
            `fps=1/${cameraFeed.interval}`,
            `data/screenshots/${recording.name}/img%03d.jpg`
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
    const export_fps = await getSetting('export_fps') ?? { value: 24 };

    createFolder(`data/videos/${recording.name}/`);

    let process = child_process.spawn("ffmpeg", [
        "-framerate",
        `${export_fps.value}`,
        "-i",
        `data/screenshots/${recording.name}/img%03d.jpg`,
        "-c:v",
        "libx264",
        "-r",
        "30",
        "-pix_fmt",
        "yuv420p",
        `data/videos/${recording.name}/timelapse.mp4`
    ], {
        detached: false,
    });
    process.stderr.on('data', (data) => {
        console.log("stderr: " + data.toString());
    });
    process.stdout.on('data', (data) => {
        console.log("stdout: " + data.toString());
    });
    process.on('exit', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

// ffmpeg -framerate 24 -i img%03d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p test.mp4