import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {insertCameraFeed} from "../../sql";
import {getRandomPort} from "../../common";

const add = (ws: WebSocket, req: WsMessage) => {
    insertCameraFeed({
        id: 0,
        name: req.data.name,
        url: req.data.url,
        interval: req.data.interval,
        wsPort: getRandomPort(),
        activeFrom: req.data.activeFrom,
        activeTo: req.data.activeTo
    });

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'camera',
        action: 'added',
        data: req
    }
    ws.send(JSON.stringify(response));
}
export default add;