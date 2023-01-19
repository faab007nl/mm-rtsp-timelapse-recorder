import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import get_status from "./get_status";

const handleSettingsRoutes = (ws: WebSocket, data: WsMessage) => {
    switch (data.action) {
        case 'get_status':
            get_status(ws, data);
            break;
    }
}
export default handleSettingsRoutes;