import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {activateCamera, deactivateCamera} from "../../cameraManager";
import {getCameraFeed} from "../../sql";
import list from "./list";

const active = async (ws: WebSocket, req: WsMessage) => {
    let cameraId = req.data.id;
    let recordingName = req.data.recordingName;

    let camera = await getCameraFeed(cameraId);
    if (camera === undefined || camera === null) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: (active ? 'activated' : 'deactivated') + ': Camera not found'
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }

    if (active) {
        activateCamera(camera, (data: any) => {
            list(ws, req);
            let response: WsResponse = {
                from: getServerUUID(),
                to: req.from,
                category: 'error',
                action: 'error',
                data: data
            };
            ws.send(JSON.stringify(response));
        });
    }else{
        deactivateCamera(camera);
    }

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: active ? 'activated' : 'deactivated',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default active;