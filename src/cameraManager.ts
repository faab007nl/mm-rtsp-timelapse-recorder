import {Camera, NewRecording, Recording} from "./include/interfaces";
import {
    getCameras,
    getRecording,
    insertRecording,
    updateCameraValue,
    updateRecordingEnded, updateRecordingValue
} from "./sql";
import * as path from "path";
import {createFolder} from "./fileUtils";
const cron = require('node-cron');
const ffmpeg = require('fluent-ffmpeg');

export const initCameraManager = async () => {
    setTimeout(async () => {
        console.log('Initializing camera manager');
        cron.schedule('* * * * *', async () => {
            const cameras = await getCameras();
            for (const camera of cameras) {
                if (
                    camera.currentRecordingId !== undefined && camera.currentRecordingId !== null &&
                    camera.interval !== undefined && camera.interval !== null
                ) {
                    const recording = await getRecording(camera.currentRecordingId);
                    if (recording === null) return;

                    const now = new Date();
                    const activeFrom = new Date(camera.activeFrom);
                    const activeTo = new Date(camera.activeTo);
                    const interval = camera.interval;

                    if (
                        activeFrom !== undefined && activeFrom !== null &&
                        activeTo !== undefined && activeTo !== null &&
                        now < activeFrom && now > activeTo &&
                        now.getMinutes() % interval !== 0
                    ){
                        takeScreenshot(camera, recording);
                    }else{
                        takeScreenshot(camera, recording);
                    }
                }
            }
        });
    }, 1000);
}

const takeScreenshot = (camera: Camera, recording: Recording) => {
    console.log('Taking screenshot for camera: ' + camera.id);

    const cameraName = camera.name.replace(/ /g, '_');
    const recordingName = recording.name.replace(/ /g, '_');

    const screenshotsFolder = path.join(__dirname, `../data/screenshots/${cameraName}/${recordingName}/`);
    const filename = new Date().toISOString().replace(/:/g, '-') + '.jpg';
    const filepath = path.join(screenshotsFolder, filename);

    createFolder(screenshotsFolder);

    ffmpeg()
        .input(camera.url)
        .outputOptions('-frames:v 1')
        .outputOptions('-q:v 20')
        .noAudio()
        .seek(0)
        .on('start', function(command: any) {
            console.log('Spawned Ffmpeg with command: ' + command);
        })
        .on('error', function(err: { message: string; }, stdout: any, stderr: any) {
            console.log('Cannot process video: ' + err.message);
        })
        .on('end', () => {
            console.log('Screenshot taken for camera: ' + camera.id);
            updateRecordingValue(recording.id, "screenshotCount", recording.screenshotCount + 1);
        })
        .save(filepath);
}


export const activateCamera = async (cameraFeed: Camera, recordingName: string, callback: any) => {
    if (cameraFeed === undefined || cameraFeed === null) return;
    if (cameraFeed.currentRecordingId !== undefined && cameraFeed.currentRecordingId !== null) return;
    if (recordingName.length === 0) {
        callback(false);
        return;
    }

    let newRecording: NewRecording = {
        cameraId: cameraFeed.id,
        name: recordingName
    }
    let recordingId = await insertRecording(newRecording);
    updateCameraValue(
        cameraFeed.id,
        'currentRecordingId',
        recordingId
    );
    callback(true);
}

export const deactivateCamera = (cameraFeed: Camera) => {
    if (cameraFeed === undefined || cameraFeed === null) return;
    if (cameraFeed.currentRecordingId === undefined || cameraFeed.currentRecordingId === null) return;

    updateRecordingEnded(cameraFeed.currentRecordingId);
    updateCameraValue(
        cameraFeed.id,
        'currentRecordingId',
        null
    );
}