import * as WebSocket from "ws";
import {WsMessage} from "../../include/interfaces";
import list from "./list";
import add from "./add";
import edit from "./edit";
import del from "./del";
import active from "./active";

const handleCameraRoutes = (ws: WebSocket, data: WsMessage) => {
    switch (data.action) {
        case 'list':
            list(ws, data);
            break;
        case 'add':
            add(ws, data);
            break;
        case 'edit':
            edit(ws, data);
            break;
        case 'del':
            del(ws, data);
            break;
        case 'active':
            active(ws, data);
            break;
    }
}
export default handleCameraRoutes;