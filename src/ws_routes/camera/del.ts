import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {deleteCameraFeed} from "../../sql";
import {getServerUUID} from "../../index";
import {deactivateCamera} from "../../cameraManager";

const del = (ws: WebSocket, req: WsMessage) => {

    deactivateCamera(req.data.id);
    deleteCameraFeed(req.data.id);

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: 'deleted',
        data: req
    }
    ws.send(JSON.stringify(response));
}
export default del;