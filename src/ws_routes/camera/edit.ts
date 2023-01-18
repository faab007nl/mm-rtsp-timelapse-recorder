import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {updateCameraFeedValue} from "../../sql";
import {getServerUUID} from "../../index";

const edit = (ws: WebSocket, req: WsMessage) => {
    let data = req.data;

    if (data.name !== null && data.name !== undefined) {
        updateCameraFeedValue(data.id, 'name', data.name);
    }
    if (data.url !== null && data.url !== undefined) {
        updateCameraFeedValue(data.id, 'url', data.url);
    }
    if (data.interval !== null && data.interval !== undefined) {
        updateCameraFeedValue(data.id, 'interval', data.interval);
    }

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: 'updated',
        data: req
    }
    ws.send(JSON.stringify(response));
}
export default edit;