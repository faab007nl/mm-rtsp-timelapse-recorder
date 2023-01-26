import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import * as child_process from "child_process";

const restart_server = (ws: WebSocket, req: WsMessage) => {
    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'settings',
        action: 'restarting_server',
        data: {}
    }
    ws.send(JSON.stringify(response));

    console.log('Restarting server...');

    // Reboot nodejs
    //child_process.exec('shutdown -r now');
}
export default restart_server;