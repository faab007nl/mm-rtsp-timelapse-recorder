const fs = require("fs-extra");
const {getCameraFeeds} = require("./sql");
const path = require("path");

const screenshotsDir = './data/screenshots';
const videoDir = './data/videos';

const createDirs = () => {
    createFolder('data');
    createFolder(screenshotsDir);
    createFolder(videoDir);
}
const emptyDir = (dir) => {
    createFolder(dir);
    fs.emptyDirSync(dir);
}
const moveFile = (oldPath, newPath) => {
    createFileFolder(oldPath);
    createFileFolder(newPath);
    fs.moveSync(oldPath, newPath, { overwrite: true });
}
const renameFile = (oldPath, newPath) => {
    createFolder(newPath);
    fs.renameSync(oldPath, newPath);
}
const deleteFile = (path) => {
    if (fileExists(path)) {
        fs.removeSync(path);
    }
}
const createFolder = (path) => {
    if (!fs.existsSync(path)) {
        fs.ensureDirSync(path, {
            mode: 0o2775
        });
    }
}
const createFileFolder = (filePath) => {
    let folderPath = path.parse(filePath).dir;
    createFolder(folderPath);
}
const readDir = (path) => {
    createFolder(path);
    return fs.readdirSync(path);
}

const getScreenshotDir = () => {
    return screenshotsDir;
}
const getVideoDir = () => {
    return videoDir;
}
const getCameraDateFolders = async (cameraId) => {
    let cameraFeeds = await getCameraFeeds();
    let cameraFeed = cameraFeeds.find(cameraFeed => cameraFeed.id === parseInt(cameraId));
    if (cameraFeed === undefined) return [];
    let cameraName = cameraFeed.name.toLowerCase().replace(/ /g, '_');

    let dir = `${getScreenshotDir()}/${cameraName}`;
    return readDir(dir);
}
const fileExists = (path) => {
    return fs.existsSync(path);
}
const isFolderEmpty = (path) => {
    return fs.readdirSync(path).length === 0;
}
const waitForFolderToExist = (path) => {
    return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            if (fileExists(path)) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

exports.createDirs = createDirs;
exports.emptyDir = emptyDir;
exports.moveFile = moveFile;
exports.renameFile = renameFile;
exports.createFolder = createFolder;
exports.readDir = readDir;
exports.getScreenshotDir = getScreenshotDir;
exports.getVideoDir = getVideoDir;
exports.getCameraDateFolders = getCameraDateFolders;
exports.fileExists = fileExists;
exports.isFolderEmpty = isFolderEmpty;
exports.deleteFile = deleteFile;
exports.waitForFolderToExist = waitForFolderToExist;