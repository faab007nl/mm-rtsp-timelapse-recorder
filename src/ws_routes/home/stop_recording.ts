import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getRecordingDuration, getRecordingStatus, stopRecording} from "../../cameraManager";

const stop_recording = (ws: WebSocket, req: WsMessage) => {
    stopRecording();

    let response: WsResponse = {
        from: getServerUUID(),
        to: 'all',
        category: 'home',
        action: 'recording_stopped',
        data: {}
    }
    ws.send(JSON.stringify(response));
}
export default stop_recording;