import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import get from "./get";
import update_video_export_fps from "./update_video_export_fps";
import restart_node from "./restart_node";
import restart_server from "./restart_server";
import set_max_recording_duration from "./set_max_recording_time";
import get_max_recording_duration from "./get_max_recording_time";

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
        case "set_max_recording_duration":
            set_max_recording_duration(ws, data);
            break;
        case "get_max_recording_duration":
            get_max_recording_duration(ws, data);
            break;
    }
}
export default handleSettingsRoutes;