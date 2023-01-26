const fs = require("fs-extra");
const path = require("path");

const emptyDir = (dir: string): void => {
    createFolder(dir);
    fs.emptyDirSync(dir);
}
const moveFile = (oldPath: string, newPath: string): void => {
    createFileFolder(oldPath);
    createFileFolder(newPath);
    fs.moveSync(oldPath, newPath, { overwrite: true });
}
const renameFile = (oldPath: string, newPath: string): void => {
    createFolder(newPath);
    fs.renameSync(oldPath, newPath);
}
const deleteFile = (path: string): void => {
    if (fileExists(path)) {
        fs.removeSync(path);
    }
}
const createFolder = (path: string): void => {
    if (!fs.existsSync(path)) {
        fs.ensureDirSync(path, {
            mode: 0o2775
        });
    }
}
const createFileFolder = (filePath: string): void => {
    let folderPath = path.parse(filePath).dir;
    createFolder(folderPath);
}
const readDir = (path: string): object => {
    createFolder(path);
    return fs.readdirSync(path);
}

const fileExists = (path: string): boolean => {
    return fs.existsSync(path);
}

const isFolderEmpty = (path: string): boolean => {
    return fs.readdirSync(path).length === 0;
}

const waitForFolderToExist = (path: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
        let interval = setInterval(() => {
            let exists: boolean = fileExists(path);
            if (exists) {
                clearInterval(interval);
                resolve(exists);
            }
        }, 100);
    });
}

export {
    emptyDir,
    moveFile,
    renameFile,
    deleteFile,
    createFolder,
    createFileFolder,
    readDir,
    fileExists,
    isFolderEmpty,
    waitForFolderToExist,
}