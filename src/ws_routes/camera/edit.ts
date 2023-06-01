import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {updateCameraValue} from "../../sql";
import {getServerUUID} from "../../index";

const edit = (ws: WebSocket, req: WsMessage) => {
    let data = req.data;

    if (data.name !== null && data.name !== undefined && data.name.length > 0) {
        updateCameraValue(data.id, 'name', data.name);
    }
    if (data.url !== null && data.url !== undefined && data.url.length > 0) {
        updateCameraValue(data.id, 'url', data.url);
    }
    if (data.interval !== null && data.interval !== undefined && data.interval > 0) {
        updateCameraValue(data.id, 'interval', data.interval);
    }
    if (data.activeFrom !== null && data.activeFrom !== undefined) {
        let activeFromParts = data.activeFrom.split(':');
        let activeFromMinutes = parseInt(activeFromParts[0]) * 60 + parseInt(activeFromParts[1]);
        updateCameraValue(data.id, 'activeFrom', `${activeFromMinutes}`);
    }
    if (data.activeTo !== null && data.activeTo !== undefined) {
        let activeToParts = data.activeTo.split(':');
        let activeToMinutes = parseInt(activeToParts[0]) * 60 + parseInt(activeToParts[1]);
        updateCameraValue(data.id, 'activeTo', `${activeToMinutes}`);
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