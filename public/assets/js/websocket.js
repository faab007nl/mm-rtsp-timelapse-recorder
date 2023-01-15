import handleMainAction from "./ws_handlers/main.js";
import handleCameraAction from "./ws_handlers/cameras.js";

window.ws_connected = false;
let ws_disconnected_msg_send = false;

window.ws_connect = () => {
    window.ws = new WebSocket(`ws://${window.config.ws_host}:${window.config.ws_port}/ws`);
    window.ws.onopen = function() {
        window.ws_connected = true;
        ws_disconnected_msg_send = false;
    }
    window.ws.onclose = function() {
        if (!ws_disconnected_msg_send){
            ws_disconnected_msg_send = true;
            alertify.notify('Disconnected', 'error', 5);
        }
        window.ws_connected = false;

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