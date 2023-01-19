export const handleSettingsAction = (action, data) => {
    switch (action) {
        case 'get':
            handleSettingsGet(data);
            break;
        case "updated":
            alertify.notify('Instellingen bijgewerkt', 'success', 2);
            break;
        case "rebooting_node":
            alertify.notify('Applicatie word herstart', 'success', 2);
            break;
        case "rebooting_server":
            alertify.notify('Server word herstart', 'success', 2);
            break;
    }
}

const handleSettingsGet = (data) => {
    const videoExportInput = document.querySelector('[data-settings-video-export-fps-input]');
    videoExportInput.value = data.video_export_fps;
}

export const requestSettings = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'get',
        data: {}
    }));
}

export const updateVideoExportFps = (target, value) => {
    if(value <= 0){
        target.classList.add('is-invalid');
        alertify.notify('Video Export FPS moet meer dan 0 zijn', 'error', 2);
        return;
    }
    if(value > 240){
        target.classList.add('is-invalid');
        alertify.notify('Video Export FPS moet 240 of lager zijn', 'error', 2);
        return;
    }

    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'update_video_export_fps',
        data: {
            video_export_fps: value
        }
    }));
}

export const restartNode = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'restart_node',
        data: {}
    }));
}
export const restartServer = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'settings',
        action: 'restart_server',
        data: {}
    }));
}