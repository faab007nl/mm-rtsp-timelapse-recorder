import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getCameraFeeds} from "../../sql";
import {getServerUUID} from "../../index";
import {cameraStreamActive} from "../../cameraManager";

const list = async (ws: WebSocket, req: WsMessage) => {
    let cameras = await getCameraFeeds();

    for (let i = 0; i < cameras.length; i++) {
        let camera = cameras[i];
        camera.active = cameraStreamActive(camera);
    }

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: 'list',
        data: {
            cameras
        }
    }
    ws.send(JSON.stringify(response));
}
export default list;