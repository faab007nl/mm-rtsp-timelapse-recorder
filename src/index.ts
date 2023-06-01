import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import { init } from "./common";
import handleCameraRoutes from "./ws_routes/camera";
import {WsMessage} from "./include/interfaces";
import { v4 } from 'uuid';
import handleSettingsRoutes from "./ws_routes/settings";
import handleRecordingRoutes from "./ws_routes/recordings";

const app = express();
const port = 4322;
const server_uuid = v4();

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({
    server,
    path: '/ws'
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        let data: WsMessage = <WsMessage>JSON.parse(message);
        switch (data.category) {
            case 'camera':
                handleCameraRoutes(ws, data);
                break;
            case 'recordings':
                handleRecordingRoutes(ws, data);
                break;
            case 'settings':
                handleSettingsRoutes(ws, data);
                break;
        }
    });

    ws.send(JSON.stringify({
        category: 'main',
        action: 'init',
        data: {}
    }));
});

app.use(express.static(path.join(__dirname, '../public')));

server.listen(port, () => {
    init();

    console.log(`Server started on port ${port} :)`);
});

export const getServerUUID = () => {
    return server_uuid;
}