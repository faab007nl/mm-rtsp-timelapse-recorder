import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getCamera} from "../../sql";
import {activateCamera} from "../../cameraManager";
import list from "./list";

const activate = async (ws: WebSocket, req: WsMessage) => {
    let cameraId = req.data.id;
    let recordingName = req.data.recordingName;

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

    if (recordingName.length === 0){
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Geen opname naam opgegeven'
            }
        };
        ws.send(JSON.stringify(response));
        return;
    }

    await activateCamera(camera, recordingName, (success: boolean) => {
        list(ws, req);
        let response: WsResponse;
        if (success){
            response = {
                from: getServerUUID(),
                to: req.from,
                category: 'camera',
                action: 'recordingStarted',
                data: {}
            }
        }else{
            response = {
                from: getServerUUID(),
                to: req.from,
                category: 'error',
                action: 'error',
                data: {
                    message: 'Kan camera niet activeren'
                }
            };
        }
        ws.send(JSON.stringify(response));
    });
}
export default activate;