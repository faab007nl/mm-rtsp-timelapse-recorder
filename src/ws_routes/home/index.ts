import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import get_status from "./get_status";
import stop_recording from "./stop_recording";
import recordings from "./recordings";
import delete_recording from "./delete_recording";
import start_recording from "./start_recording";

const handleHomeRoutes = (ws: WebSocket, data: WsMessage) => {
    switch (data.action) {
        case 'get_status':
            get_status(ws, data);
            break;
        case 'start_recording':
            start_recording(ws, data);
            break;
        case 'stop_recording':
            stop_recording(ws, data);
            break;
        case 'recordings':
            recordings(ws, data);
            break;
        case 'delete_recording':
            delete_recording(ws, data);
            break;
    }
}
export default handleHomeRoutes;