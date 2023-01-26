import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {setSetting} from "../../sql";

const set_max_recording_duration = (ws: WebSocket, req: WsMessage) => {
    const max_recording_duration = req.data.max_recording_duration;

    if (max_recording_duration === undefined) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'success',
            action: 'error',
            data: {
                message: 'Max recording time is undefined'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }

    if (max_recording_duration < 0) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Max recording time moet meer dan 0 zijn'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }

    setSetting({
        key: 'max_recording_duration',
        value: max_recording_duration
    });

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'max_recording_duration_updated',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default set_max_recording_duration;