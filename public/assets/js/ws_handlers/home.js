export const handleHomeAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Connection Ready', 'success', 2);
            break;
    }
}

export const requestActiveCameraCount = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'active_camera_count',
        data: {}
    }));
}