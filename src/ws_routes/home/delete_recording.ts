import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {deleteRecording} from "../../sql";

const delete_recording = async (ws: WebSocket, req: WsMessage) => {
    deleteRecording(req.data.id);

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'deleted_recording',
        data: {}
    }
    ws.send(JSON.stringify(response));
}

export default delete_recording;