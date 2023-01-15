import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import { init } from "./common";

const app = express();
const port = 8080;

//initialize a simple http server
const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = new WebSocket.Server({
    server,
    path: '/ws'
});

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        let data = JSON.parse(message);
        console.log(data);
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