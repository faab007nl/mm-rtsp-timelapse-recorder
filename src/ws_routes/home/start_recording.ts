import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getActiveCameraStreams, getRecordingDuration, getRecordingStatus, startRecording} from "../../cameraManager";

const start_recording = (ws: WebSocket, req: WsMessage) => {
    let activeCameraStreams = getActiveCameraStreams();
    if(Object.keys(activeCameraStreams).length === 0){
        let response: WsResponse = {
            from: getServerUUID(),
            to: 'all',
            category: 'error',
            action: 'error',
            data: {
                message: 'No active camera streams'
            }
        }
        ws.send(JSON.stringify(response));
        return;
    }

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