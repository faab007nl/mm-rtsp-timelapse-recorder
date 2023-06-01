import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import recordings from "./recordings";
import delete_recording from "./delete_recording";

const handleRecordingRoutes = (ws: WebSocket, data: WsMessage) => {
    switch (data.action) {
        case 'list':
            recordings(ws, data);
            break;
        case 'delete':
            delete_recording(ws, data);
            break;
    }
}
export default handleRecordingRoutes;