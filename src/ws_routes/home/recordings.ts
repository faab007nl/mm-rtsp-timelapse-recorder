import * as WebSocket from "ws";
import {Recording, WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getRecordings} from "../../sql";

const recordings = async (ws: WebSocket, req: WsMessage) => {
    let recordings: Recording[] = await getRecordings();

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'recordings',
        data: {
            recordings: recordings
        }
    }
    ws.send(JSON.stringify(response));
}

export default recordings;