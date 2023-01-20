import * as WebSocket from "ws";
import {Recording, WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {insertRecording} from "../../sql";

const add_recording = async (ws: WebSocket, req: WsMessage) => {
    let recording: Recording = {
        id: 0,
        name: req.data.name,
        duration: 0,
        datetime: Date.now(),
    };

    insertRecording(recording);

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'added_recording',
        data: {}
    }
    ws.send(JSON.stringify(response));
}

export default add_recording;