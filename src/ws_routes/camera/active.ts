import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";

const active = (ws: WebSocket, req: WsMessage) => {
    let active = req.data.active;

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