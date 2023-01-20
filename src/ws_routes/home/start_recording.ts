import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getRecordingDuration, getRecordingStatus, startRecording} from "../../cameraManager";

const start_recording = (ws: WebSocket, req: WsMessage) => {
    startRecording();

    let response: WsResponse = {
        from: getServerUUID(),
        to: 'all',
        category: 'home',
        action: 'recording_started',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default start_recording;