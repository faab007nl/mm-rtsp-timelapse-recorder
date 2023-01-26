import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {setSetting} from "../../sql";

const update_video_export_fps = (ws: WebSocket, req: WsMessage) => {
    const video_export_fps = req.data.video_export_fps;

    if (video_export_fps === undefined) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Video Export FPS is undefined'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }

    if (video_export_fps <= 0) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Video Export FPS moet meer dan 0 zijn'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }
    if (video_export_fps > 240) {
        let response: WsResponse = {
            from: getServerUUID(),
            to: req.from,
            category: 'error',
            action: 'error',
            data: {
                message: 'Video Export FPS moet 240 of lager zijn'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }

    setSetting({
        key: 'video_export_fps',
        value: video_export_fps
    });

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'settings',
        action: 'updated',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default update_video_export_fps;