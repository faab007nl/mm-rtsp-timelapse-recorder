const {exec} = require("child_process");
const {getCameraFeeds, getSetting} = require("./sql");
const {Recorder} = require("../libs/node-rtsp-recorder");
const {getScreenshotDir, getVideoDir, createFolder, renameFile, emptyDir, fileExists, isFolderEmpty, moveFile,
    deleteFile
} = require("./fileUtils");
const path = require("path");
const moment = require("moment");

let currentSeconds = 0;
let cameraImgNumbering = {};
let cameraFirstRun = {};
let generateVideoStatus = {};

const handleCameraFeeds = async () => {
    currentSeconds++;
    let cameraFeeds = await getCameraFeeds();
    cameraFeeds.forEach(cameraFeed => {
        let name = cameraFeed.name.toLowerCase().replace(/ /g, '_');
        let url = cameraFeed.url;
        let interval = cameraFeed.interval;
        let active = cameraFeed.active;

        if (active !== 'true') return;

        if (currentSeconds % interval === 0) {
            takeScreenshot(name, url);
        }
    });
}

const takeScreenshot = (name, url) => {
    let rec = new Recorder({
        url: url,
        folder: getScreenshotDir(),
        name: name,
        type: 'image',
        directoryPathFormat: 'DD-MM-YYYY',
    });

    if (cameraFirstRun[name] === undefined) {
        cameraFirstRun[name] = true;
        let dir = `${getScreenshotDir()}/${name}/${moment().format('DD-MM-YYYY')}`;
        emptyDir(dir);
    }

    console.log(`Taking screenshot for ${name}...`);
    rec.captureImage((filePath) => {
        if(cameraImgNumbering[name] === undefined) {
            cameraImgNumbering[name] = 1;
        }else{
            cameraImgNumbering[name]++;
        }

        let folderPath = path.parse(filePath).dir;
        let fileExtension = path.parse(filePath).ext;
        let newFileName = `image_${cameraImgNumbering[name]}${fileExtension}`
        let newFilePath = path.join(folderPath, newFileName);

        console.log(`Image saved to ${filePath} for ${name}`);
        console.log(`Renaming ${filePath} to ${newFilePath} for ${name}`);
        if(fileExists(filePath)) {
            moveFile(filePath, newFilePath);
        }
    });
}

const generateVideo = async (cameraId, date) => {
    let cameraFeeds = await getCameraFeeds();
    let cameraFeed = cameraFeeds.find(cameraFeed => cameraFeed.id === parseInt(cameraId));
    let cameraName = cameraFeed.name.toLowerCase().replace(/ /g, '_');

    let imagesFolder = `${getScreenshotDir()}/${cameraName}/${date}/image`;
    let exportFolder = `${getVideoDir()}/${cameraName}/${date}`;
    let videoFileName = 'timelapse.mp4';
    let filePath = `${exportFolder}/${videoFileName}`;
    deleteFile(filePath);

    generateVideoStatus[cameraId] = {
        [date]: {
            status: 'generating',
            message: null,
        }
    };

    if(isFolderEmpty(imagesFolder)) {
        generateVideoStatus[cameraId] = {
            [date]: {
                status: 'error',
                message: 'Er zijn geen foto\'s gevonden!',
            }
        };
        return;
    }

    createFolder(exportFolder);

    let videoFps = await getSetting('fps');
    if (videoFps === null) {
        videoFps = 24;
    }

    let command = `ffmpeg -framerate ${videoFps} -i ${imagesFolder}/image_%d.jpg -c:v libx264 -r 30 -pix_fmt yuv420p ${filePath}`;
    exec(command, (err, stdout, stderr) => {
        if (err) {
            generateVideoStatus[cameraId] = {
                [date]: {
                    status: 'error',
                    message: err.message,
                }
            };
        }else{
            generateVideoStatus[cameraId] = {
                [date]: {
                    status: 'success',
                    message: null,
                }
            };
        }
    });
}

const getGenerateVideoStatus = (cameraId, date) => {
    let cameraStatus = generateVideoStatus[cameraId];
    if (cameraStatus === undefined) {
        return {
            status: 'not found',
            message: null,
        }
    }
    let dateStatus = cameraStatus[date];
    if (dateStatus === undefined) {
        return {
            status: 'not found',
            message: null,
        }
    }
    return dateStatus;
}

const getCurrentSeconds = () => {
    return currentSeconds;
}
const setCurrentSeconds = (seconds) => {
    currentSeconds = seconds;
}

const resetCameraImgNumbering = () => {
    cameraImgNumbering = {};
}
const resetCameraFirstRun = () => {
    cameraFirstRun = {};
}

exports.handleCameraFeeds = handleCameraFeeds;
exports.generateVideo = generateVideo;
exports.getCurrentSeconds = getCurrentSeconds;
exports.setCurrentSeconds = setCurrentSeconds;
exports.resetCameraImgNumbering = resetCameraImgNumbering;
exports.resetCameraFirstRun = resetCameraFirstRun;
exports.getGenerateVideoStatus = getGenerateVideoStatus;