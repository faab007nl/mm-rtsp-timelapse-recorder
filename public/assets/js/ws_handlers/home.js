export const handleHomeAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Connection Ready', 'success', 2);
            break;
        case "get_status":
            updateStatus(data);
            break;
        case "get_max_recording_duration":
            updateMaxRecordingDuration(data);
            break;
        case "max_recording_duration_updated":
            alertify.notify('Max recording duration updated', 'success', 2);
            break;
        case "recording_started":
            alertify.notify('Opname gestart', 'success', 2);
            break;
        case "recording_stoppen":
            alertify.notify('Opname gestopt', 'success', 2);
            break;
        case "recordings":
            updateRecordings(data);
            break;
    }
}

const updateStatus = (data) => {
    const startRecordingBtn = document.querySelector('[data-start-recording]');
    const stopRecordingBtn = document.querySelector('[data-stop-recording]');
    const recordingDuration = document.querySelector('[data-recording-duration]');
    const activeCameraCount = document.querySelector('[data-active-camera-count]');
    const totalCameraCount = document.querySelector('[data-total-camera-count]');

    if (data.recording_status === 0) {
        startRecordingBtn.classList.remove('disabled');
        stopRecordingBtn.classList.add('disabled');
    }
    if (data.recording_status === 1) {
        startRecordingBtn.classList.add('disabled');
        stopRecordingBtn.classList.remove('disabled');
    }

    recordingDuration.innerHTML = moment().startOf('day')
        .seconds(data.recording_duration)
        .format('HH:mm:ss');
    activeCameraCount.innerHTML = data.active_camera;
    totalCameraCount.innerHTML = data.total_cameras;
}

const updateMaxRecordingDuration = (data) => {
    const maxRecordingDurationInput = document.querySelector('[data-max-recording-duration-input]');
    maxRecordingDurationInput.value = data.max_recording_duration;
}

const updateRecordings = (data) => {
    const recordingsContainer = document.querySelector('[data-recordings-container]');

    let recordings = data.recordings.reverse();
    recordingsContainer.innerHTML = '';

    recordings.forEach(recording => {
        const row = document.createElement('div');
        row.classList.add('row');

        row.innerHTML = `
            <div class="col-auto">
                <span class="avatar bg-info">
                    <i class="fa-solid fa-video text-white"></i>
                </span>
            </div>
            <div class="col">
                <div class="text-truncate">
                    ${recording.name} <span class="badge bg-blue">${moment.utc(recording.duration * 1000).format('HH:mm:ss')}</span>
                </div>
                <div class="text-muted">${moment(recording.datetime).format('DD-MM-YYYY h:mm:ss')} (started ${moment(recording.datetime).fromNow()})</div>
            </div>
            <div class="col-auto d-flex gap-2 fs-1">
                <a href="#" data-bs-toggle="modal" data-bs-target="#view-camera-video-model">
                    <div class="video-btn">
                        <i class="fa-solid fa-eye"></i>
                    </div>
                </a>
                <div class="video-btn">
                    <i class="fa-solid fa-download"></i>
                </div>
            </div>
        `;
        recordingsContainer.append(row);
    });
}

export const requestStatus = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'get_status',
        data: {}
    }));
}

export const requestRecordings = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'recordings',
        data: {}
    }));
}

export const requestMaxRecordingDuration = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'get_max_recording_duration',
        data: {}
    }));
}

export const startRecording = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'start_recording',
        data: {}
    }));
}

export const stopRecording = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'stop_recording',
        data: {}
    }));
}

export const setMaxRecordingDuration = (duration) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'set_max_recording_duration',
        data: {
            max_recording_duration: duration
        }
    }));
}