import {Database, sqlite3} from "sqlite3";
import {CameraFeed, Recording, Setting} from "./include/interfaces";

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
            db.run('CREATE TABLE IF NOT EXISTS '+cameraFeedTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `url` TEXT, `interval` INTEGER, `wsPort` INTEGER)');
            db.run('CREATE TABLE IF NOT EXISTS '+settingsTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `key` TEXT, `value` TEXT, UNIQUE(`key`))');
            db.run('CREATE TABLE IF NOT EXISTS '+recordingsTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `duration` INTEGER, `datetime` INTEGER)');
        });
    });
}
export const insertCameraFeed = (cameraFeed: CameraFeed): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'INSERT INTO '+cameraFeedTableName+' (`name`, `url`, `interval`, `wsPort`) VALUES (?, ?, ?, ?)',
            [cameraFeed.name, cameraFeed.url, cameraFeed.interval, cameraFeed.wsPort]
        );
    });
}
export const updateCameraFeedValue = (id: number, key: string, value: string): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+cameraFeedTableName+' SET `'+key+'` = ? WHERE `id` = ?',
            [value, id]
        );
    });
}
export const deleteCameraFeed = (id: number): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('DELETE FROM '+cameraFeedTableName+' WHERE `id` = ?', [id]);
    });
}
export const getCameraFeeds = async (): Promise<CameraFeed[]> => {
    if (db === null || db === undefined) return [];
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT * FROM ' + cameraFeedTableName, (err, rows) => {
                if (err) reject(err);
                resolve(<CameraFeed[]>rows);
            });
        });
    });
}

export const getCameraFeedsCount = async (): Promise<number> => {
    if (db === null || db === undefined) return 0;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT COUNT(*) as count FROM ' + cameraFeedTableName, (err, row) => {
                if (err) reject(err);
                resolve(<number>row.count);
            });
        });
    });
}

export const getCameraFeed = async (id: number): Promise<CameraFeed|null> => {
    if (db === null || db === undefined) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * FROM ' + cameraFeedTableName + ' WHERE `id` = ?', [id], (err, row) => {
                if (err) reject(err);
                if (row !== undefined) {
                    resolve(<CameraFeed>row);
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

export const insertRecording = async (recording: Recording): Promise<number> => {
    if (db === null || db === undefined) return -1;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                'INSERT INTO '+recordingsTableName+' (`name`, `duration`, `datetime`) VALUES (?, ?, ?)',
                [recording.name, recording.duration, recording.datetime]
            );
            db.get('SELECT last_insert_rowid() as id', (err, row) => {
                if (err) reject(err);
                resolve(row.id);
            });
        });
    });
}

export const updateRecordingDuration = (recording: Recording): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run(
            'UPDATE '+recordingsTableName+' SET `duration` = ? WHERE `id` = ?',
            [recording.duration, recording.id]
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

export const deleteRecording = (id: number): void => {
    if (db === null || db === undefined) return;
    db.serialize(() => {
        db.run('DELETE FROM '+recordingsTableName+' WHERE `id` = ?', [id]);
    });
}
