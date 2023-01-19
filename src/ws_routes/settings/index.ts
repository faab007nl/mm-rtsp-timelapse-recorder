import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import get from "./get";
import update_video_export_fps from "./update_video_export_fps";
import restart_node from "./restart_node";
import restart_server from "./restart_server";

const handleSettingsRoutes = (ws: WebSocket, data: WsMessage) => {
    switch (data.action) {
        case 'get':
            get(ws, data);
            break;
        case 'restart_node':
            restart_node(ws, data);
            break;
        case 'restart_server':
            restart_server(ws, data);
            break;
        case "update_video_export_fps":
            update_video_export_fps(ws, data);
            break;
    }
}
export default handleSettingsRoutes;