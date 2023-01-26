import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getSetting} from "../../sql";

const get_max_recording_duration = async (ws: WebSocket, req: WsMessage) => {
    const max_recording_duration = await getSetting('max_recording_duration') ?? { value: 0 };

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'get_max_recording_duration',
        data: {
            max_recording_duration: max_recording_duration.value
        }
    }
    ws.send(JSON.stringify(response));
}
export default get_max_recording_duration;