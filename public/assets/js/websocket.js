import handleMainAction from "./ws_handlers/main.js";
import handleCameraAction from "./ws_handlers/cameras.js";

window.ws_connect = () => {
    window.ws = new WebSocket(`ws://${window.config.ws_host}:${window.config.ws_port}/ws`);
    window.ws.onopen = function() {
        alertify.notify('Connected', 'success', 2);
    }
    window.ws.onclose = function() {
        alertify.notify('Disconnected', 'error', 2);
        setTimeout(function() {
            window.ws_connect();
        }, 1000);
    }
    window.ws.onerror = function(event) {
        console.error('Connection encountered error: ', event, 'Closing socket');
        window.ws.close();
    };

    // On message received
    window.ws.onmessage = function(event) {
        let message = JSON.parse(event.data);
        handleWsMessage(message);
    }
}

const handleWsMessage = (message) => {
    let category = message.category;
    let action = message.action;
    let data = message.data;

    switch (category) {
        case 'main':
            handleMainAction(action, data);
            break;
        case 'camera':
            handleCameraAction(action, data);
            break;
        default:
            console.error('Unknown category', category);
    }
}

window.ws_connect();