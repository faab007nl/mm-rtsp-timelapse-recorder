const cron = require('node-cron');
const path = require('path');
const express = require('express');
const app = express();

const { getCameraFeeds, createDbTables, insertCameraFeed, updateCameraFeedKey, deleteCameraFeed, getSetting, setSetting,
    deleteSetting
} = require('./sql');
const { createDirs, fileExists, readDir, getScreenshotDir} = require('./fileUtils');
const {handleCameraFeeds, setCurrentSeconds, getCurrentSeconds, resetCameraImgNumbering, resetCameraFirstRun,
    generateVideo, getGenerateVideoStatus
} = require("./feedManager");
const {recordingStatuses} = require("./enums");

const port = 3378;

let recordingStatus = recordingStatuses.STOPPED;

const main = () => {
    console.log('Starting...');

    // Create directories
    createDirs();

    // Create DB tables
    createDbTables();

    // Start cron job
    cron.schedule(`* * * * * *`, async () => {
        if (recordingStatus !== recordingStatuses.RUNNING) {
            if (recordingStatus === recordingStatuses.STOPPED) {
                resetCameraImgNumbering();
                resetCameraFirstRun();
            }
            return;
        }

        let timeLimit = await getSetting('timeLimit');
        if (timeLimit === null) {
            timeLimit = 0;
        }

        if (timeLimit !== 0 && getCurrentSeconds() > (parseInt(timeLimit) * 60)) {
            setCurrentSeconds(0);
            recordingStatus = recordingStatuses.STOPPED;
        }

        handleCameraFeeds().then(r => {
        });
    });
    console.log('Started!');
}

// ----------------------------------------
// --------------Web server----------------
// ----------------------------------------

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API
app.get('/api/status', async (req, res) => {
    res.json({
        status: 'ok',
    });
});
app.get('/api/recoding/status', async (req, res) => {
    let cameraFeeds = await getCameraFeeds();
    let duration = getCurrentSeconds() - 2;
    if (duration < 0) {
        duration = 0;
    }

    res.json({
        status: recordingStatus,
        duration: duration,
        activeFeeds: cameraFeeds.filter(feed => feed.active === 'true').length,
    });
});
app.get('/api/recoding/start', (req, res) => {
    recordingStatus = recordingStatuses.RUNNING;
    res.json({ status: 'ok' });
});
app.get('/api/recoding/pause', (req, res) => {
    recordingStatus = recordingStatuses.PAUSED;
    res.json({ status: 'ok' });
});
app.get('/api/recoding/stop', (req, res) => {
    recordingStatus = recordingStatuses.STOPPED;
    setCurrentSeconds(0);
    res.json({ status: 'ok' });
});

app.get('/api/cameras', async function (req, res) {
    let cameraFeeds = await getCameraFeeds();
    res.json({
        status: 'ok',
        cameras: cameraFeeds
    });
});
app.get('/api/cameras/add', function(req, res) {
    let data = req.query.data;
    if (!data || data.length === 0) {
        res.json({ status: 'error', message: 'Missing data' });
        return;
    }

    let jsonData = JSON.parse(atob(data));
    let name = jsonData.name;
    let url = jsonData.url;
    let active = jsonData.active;
    let interval = jsonData.interval;

    insertCameraFeed(name, url, interval, active);

    res.json({
        status: 'ok',
        camera: {
            name,
            url,
            active,
            interval,
        }
    });
});
app.get('/api/cameras/update', function(req, res) {
    let id = parseInt(req.query.id);
    let key = req.query.key;
    let value = atob(req.query.value);

    if (!id || id.length === 0) {
        res.json({ status: 'error', message: 'Missing id' });
        return;
    }
    if (!key || key.length === 0) {
        res.json({ status: 'error', message: 'Missing key' });
        return;
    }
    if (!value || value.length === 0) {
        res.json({ status: 'error', message: 'Missing value' });
        return;
    }

    updateCameraFeedKey(id, key, value);

    res.json({
        status: 'ok',
    });
});
app.get('/api/cameras/delete', function(req, res) {
    let id = parseInt(req.query.id);
    if (!id || id.length === 0) {
        res.json({ status: 'error', message: 'Missing id' });
        return;
    }

    deleteCameraFeed(id);

    res.json({
        status: 'ok',
    });
});

app.get('/api/video/dates', async function (req, res) {
    let id = parseInt(req.query.id);
    if (!id || id.length === 0) {
        res.json({ status: 'error', message: 'Missing id' });
        return;
    }

    let cameraFeeds = await getCameraFeeds();
    let cameraFeed = cameraFeeds.find(cameraFeed => cameraFeed.id === parseInt(id));
    if (cameraFeed === undefined) return [];
    let cameraName = cameraFeed.name.toLowerCase().replace(/ /g, '_');

    let datesDir = `${getScreenshotDir()}/${cameraName}`;
    let dates = readDir(datesDir);
    res.json({
        status: 'ok',
        dates,
    });
});
app.get('/api/video/generate', function(req, res) {
    let id = parseInt(req.query.id);
    let date = req.query.date;
    if (!id || id.length === 0) {
        res.json({ status: 'error', message: 'Missing id' });
        return;
    }
    if (!date || date.length === 0) {
        res.json({ status: 'error', message: 'Missing date' });
        return;
    }

    generateVideo(id, date).then(r => {});

    res.json({
        status: 'ok',
    });
});
app.get('/api/video/status', function(req, res) {
    let id = parseInt(req.query.id);
    let date = req.query.date;
    if (!id || id.length === 0) {
        res.json({ status: 'error', message: 'Missing id' });
        return;
    }
    if (!date || date.length === 0) {
        res.json({ status: 'error', message: 'Missing date' });
        return;
    }

    res.json(getGenerateVideoStatus(id, date));
});
app.get('/api/video/download', async function (req, res) {
    let id = parseInt(req.query.id);
    let date = req.query.date;
    if (!id || id.length === 0) {
        res.json({status: 'error', message: 'Missing id'});
        return;
    }
    if (!date || date.length === 0) {
        res.json({status: 'error', message: 'Missing date'});
        return;
    }

    let cameraFeeds = await getCameraFeeds();
    let cameraFeed = cameraFeeds.find(cameraFeed => cameraFeed.id === parseInt(id));
    if (!cameraFeed) {
        res.json({status: 'error', message: 'Camera not found'});
        return;
    }
    let cameraName = cameraFeed.name.toLowerCase().replace(/ /g, '_');

    let videoPath = path.join(__dirname, '../data/videos', cameraName, date, 'timelapse.mp4');

    if (!fileExists(videoPath)) {
        res.json({status: 'error', message: 'Video not found'});
        return;
    }

    res.download(videoPath);
});

app.get('/api/settings', async function (req, res) {
    let key = req.query.key;
    if (!key || key.length === 0) {
        res.json({status: 'error', message: 'Missing key'});
        return;
    }

    let value = await getSetting(key);

    res.json({
        status: 'ok',
        value: value,
    });
});
app.get('/api/settings/set', function(req, res) {
    let key = req.query.key;
    let value = req.query.value;
    if (!key || key.length === 0) {
        res.json({ status: 'error', message: 'Missing key' });
        return;
    }
    if (!value || value.length === 0) {
        res.json({ status: 'error', message: 'Missing value' });
        return;
    }

    setSetting(key, value);

    res.json({
        status: 'ok',
    });
});
app.get('/api/settings/delete', function(req, res) {
    let key = req.query.key;
    if (!key || key.length === 0) {
        res.json({ status: 'error', message: 'Missing key' });
        return;
    }

    deleteSetting(key);

    res.json({
        status: 'ok',
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
    main();
});