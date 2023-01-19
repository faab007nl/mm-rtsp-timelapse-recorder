import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import * as child_process from "child_process";

const restart_node = (ws: WebSocket, req: WsMessage) => {
    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'settings',
        action: 'restarting_node',
        data: {}
    }
    ws.send(JSON.stringify(response));

    console.log('Restarting node...');

    // Reboot nodejs
    child_process.exec('pm2 restart 0', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
}

export default restart_node;