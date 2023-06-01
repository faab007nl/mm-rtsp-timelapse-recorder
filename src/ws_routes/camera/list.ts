import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getCameras} from "../../sql";
import {getServerUUID} from "../../index";

const list = async (ws: WebSocket, req: WsMessage) => {
    let cameras = await getCameras();

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