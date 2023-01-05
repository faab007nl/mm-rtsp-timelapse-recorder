const {createFolder, waitForFolderToExist} = require("./fileUtils");
const sqlite3 = require('sqlite3').verbose();
let db = null;

const cameraFeedTableName = 'camera_feeds';
const settingsTableName = 'settings';

const createDbTables = () => {
    waitForFolderToExist('data').then(() => {
        db = new sqlite3.Database('data/data.db');

        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS '+cameraFeedTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `name` TEXT, `url` TEXT, `interval` INTEGER, `active` INTEGER)');
            db.run('CREATE TABLE IF NOT EXISTS '+settingsTableName+' (id INTEGER PRIMARY KEY AUTOINCREMENT, `key` TEXT, `value` TEXT, UNIQUE(`key`))');
        });
    });
}
const insertCameraFeed = (name, url, interval, active) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('INSERT INTO '+cameraFeedTableName+' (`name`, `url`, `interval`, `active`) VALUES (?, ?, ?, ?)', [name, url, interval, active]);
    });
}
const updateCameraFeed = (id, name, url, interval, active) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('UPDATE '+cameraFeedTableName+' SET `name` = ?, `url` = ?, `interval` = ?, `active` = ? WHERE `id` = ?', [name, url, interval, active, id]);
    });
}
const updateCameraFeedKey = (id, key, value) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('UPDATE '+cameraFeedTableName+' SET `'+key+'` = ? WHERE `id` = ?', [value, id]);
    });
}
const deleteCameraFeed = (id) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('DELETE FROM '+cameraFeedTableName+' WHERE `id` = ?', [id]);
    });
}
const getCameraFeeds = async () => {
    if (db === null) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT * FROM ' + cameraFeedTableName, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    });
}

const getSetting = async (key) => {
    if (db === null) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT value FROM ' + settingsTableName + ' WHERE `key` = ?', [key], (err, row) => {
                if (err) reject(err);
                if (row !== undefined) {
                    resolve(row.value);
                } else {
                    resolve(null);
                }
            });
        });
    });
}
const setSetting = (key, value) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('INSERT OR REPLACE INTO '+settingsTableName+' (`key`, `value`) VALUES (?, ?)', [key, value]);
    });
}
const settingExists = async (key) => {
    if (db === null) return null;
    return await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT value FROM ' + settingsTableName + ' WHERE `key` = ?', [key], (err, row) => {
                if (err) reject(err);
                resolve(row !== undefined);
            });
        });
    });
}
const deleteSetting = (key) => {
    if (db === null) return;
    db.serialize(() => {
        db.run('DELETE FROM '+settingsTableName+' WHERE `key` = ?', [key]);
    });
}

exports.createDbTables = createDbTables;
exports.insertCameraFeed = insertCameraFeed;
exports.updateCameraFeed = updateCameraFeed;
exports.updateCameraFeedKey = updateCameraFeedKey;
exports.deleteCameraFeed = deleteCameraFeed;
exports.getCameraFeeds = getCameraFeeds;
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.settingExists = settingExists;
exports.deleteSetting = deleteSetting;