import {Database, sqlite3} from "sqlite3";
import {Camera, NewCamera, NewRecording, Recording, Setting} from "./include/interfaces";

const {waitForFolderToExist} = require("./fileUtils");
const sqlite3 = require('sqlite3').verbose();
let db: Database;

const cameraFeedTableName = 'camera_feeds';
const settingsTableName = 'settings';
const recordingsTableName = 'recordings';

export const createDbTables = (): void => {
    waitForFolderToExist('data').then(() => {
        db = new sqlite3.Database('data/data.db');

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS '+cameraFeedTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `url` TEXT, `interval` INTEGER, `activeFrom` INTEGER, `activeTo` INTEGER, `currentRecordingId` INTEGER NULLABLE)');
            db.run('CREATE TABLE IF NOT EXISTS '+settingsTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `key` TEXT, `value` TEXT, UNIQUE(`key`))');
            db.run('CREATE TABLE IF NOT EXISTS '+recordingsTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `cameraId` INTEGER, `name` TEXT, `screenshotCount` INTEGER, `started` INTEGER, `ended` INTEGER NULLABLE, `videoGenerated` INTEGER)');
        });
    });
}
export const insertCamera = (cameraFeed: NewCamera): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'INSERT INTO '+cameraFeedTableName+' (`name`, `url`, `interval`, `activeFrom`, `activeTo`, `currentRecordingId`) VALUES (?, ?, ?, ?, ?, ?)',
            [cameraFeed.name, cameraFeed.url, cameraFeed.interval, cameraFeed.activeFrom, cameraFeed.activeTo, null]
        );
    });
}
export const updateCameraValue = (id: number, key: string, value: string|number|null): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+cameraFeedTableName+' SET `'+key+'` = ? WHERE `id` = ?',
            [value, id]
        );
    });
}
export const deleteCamera = (id: number): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('DELETE FROM '+cameraFeedTableName+' WHERE `id` = ?', [id]);
    });
}
export const getCameras = async (): Promise<Camera[]> => {
    if (db === null || db === undefined) return [];
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT * FROM ' + cameraFeedTableName, (err, rows) => {
                if (err) reject(err);
                resolve(<Camera[]>rows);
            });
        });
    });
}
export const getCamera = async (id: number): Promise<Camera|null> => {
    if (db === null || db === undefined) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * FROM ' + cameraFeedTableName + ' WHERE `id` = ?', [id], (err, row) => {
                if (err) reject(err);
                if (row !== undefined) {
                    resolve(<Camera>row);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

export const getSetting = async (key: string): Promise<Setting|null> => {
    if (db === null || db === undefined) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT value FROM ' + settingsTableName + ' WHERE `key` = ?', [key], (err, row) => {
                if (err) reject(err);
                if (row !== undefined) {
                    resolve(<Setting>row);
                } else {
                    resolve(null);
                }
            });
        });
    });
}
export const setSetting = (setting: Setting): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('INSERT OR REPLACE INTO '+settingsTableName+' (`key`, `value`) VALUES (?, ?)', [setting.key, setting.value]);
    });
}
export const settingExists = async (key: string): Promise<boolean> => {
    if (db === null || db === undefined) return false;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT value FROM ' + settingsTableName + ' WHERE `key` = ?', [key], (err, row) => {
                if (err) reject(err);
                resolve(row !== undefined);
            });
        });
    });
}
export const deleteSetting = (key: string): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('DELETE FROM '+settingsTableName+' WHERE `key` = ?', [key]);
    });
}


export const insertRecording = async (recording: NewRecording): Promise<number> => {
    if (db === null || db === undefined) return -1;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                'INSERT INTO '+recordingsTableName+' (`cameraId`, `name`, `screenshotCount`, `started`, `ended`, `videoGenerated`) VALUES (?, ?, ?, ?, ?, ?)',
                [recording.cameraId, recording.name, 0, Date.now(), undefined, false]
            );
            db.get('SELECT last_insert_rowid() as id', (err, row) => {
                if (err) reject(err);
                resolve(row.id);
            });
        });
    });
}

export const updateRecordingEnded = (id: number): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+recordingsTableName+' SET `ended` = ? WHERE `id` = ?',
            [Date.now(), id]
        );
    });
}
export const updateRecordingValue = (id: number, key: string, value: string|number|null): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+recordingsTableName+' SET `'+key+'` = ? WHERE `id` = ?',
            [value, id]
        );
    });
}
export const updateRecording = (recording: Recording): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+recordingsTableName+' SET `screenshotCount` = ?, `videoGenerated` = ? WHERE `id` = ?',
            [recording.screenshotCount, recording.videoGenerated, recording.id]
        );
    });
}

export const getRecordings = async (): Promise<Recording[]> => {
    if (db === null || db === undefined) return [];
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT * FROM ' + recordingsTableName, (err, rows) => {
                if (err) reject(err);
                resolve(<Recording[]>rows);
            });
        });
    });
}

export const getRecording = async (id: number): Promise<Recording|null> => {
    if (db === null || db === undefined) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * FROM ' + recordingsTableName + ' WHERE `id` = ?', [id], (err, row) => {
                if (err) reject(err);
                if (row !== undefined) {
                    resolve(<Recording>row);
                } else {
                    resolve(null);
                }
            });
        });
    });
}

export const deleteRecording = (id: number): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('DELETE FROM '+recordingsTableName+' WHERE `id` = ?', [id]);
    });
}
