import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getRecordingDuration, getRecordingStatus} from "../../cameraManager";

const get_status = (ws: WebSocket, req: WsMessage) => {
    const recording_status = getRecordingStatus();
    const recording_duration = getRecordingDuration();

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'settings',
        action: 'get_status',
        data: {
            recording_status: recording_status,
            recording_duration: recording_duration
        }
    }
    ws.send(JSON.stringify(response));
}
export default get_status;