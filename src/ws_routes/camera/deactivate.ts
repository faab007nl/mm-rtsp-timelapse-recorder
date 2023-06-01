import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getCamera} from "../../sql";
import {deactivateCamera} from "../../cameraManager";
import list from "./list";

const deactivate = async (ws: WebSocket, req: WsMessage) => {
    let cameraId = req.data.id;

    let camera = await getCamera(cameraId);
    if (camera === undefined || camera === null) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Kan camera niet vinden'
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }

    deactivateCamera(camera);

    list(ws, req);
    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: 'recordingStopped',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default deactivate;