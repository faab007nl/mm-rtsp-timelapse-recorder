import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getSetting} from "../../sql";

const get = async (ws: WebSocket, req: WsMessage) => {
    const video_export_fps = await getSetting('video_export_fps') ?? {value: 24};

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'settings',
        action: 'get',
        data: {
            video_export_fps: video_export_fps.value
        }
    }
    ws.send(JSON.stringify(response));
}
export default get;