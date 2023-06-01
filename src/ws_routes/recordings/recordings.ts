import * as WebSocket from "ws";
import {Recording, WsMessage, WsResponse} from "../../include/interfaces";
import {getRecordings} from "../../sql";
import {getServerUUID} from "../../index";

const recordings = async (ws: WebSocket, req: WsMessage) => {
    let recordings: Recording[] = await getRecordings();

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'recordings',
        action: 'list',
        data: {
            recordings: recordings
        }
    }
    ws.send(JSON.stringify(response));
}

export default recordings;