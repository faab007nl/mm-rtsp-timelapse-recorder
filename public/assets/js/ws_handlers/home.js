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

export const requestStatus = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'get_status',
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