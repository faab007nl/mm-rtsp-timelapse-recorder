import * as WebSocket from "ws";
import {WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {
    getActiveCameraStreamsCount,
    getRecordingDuration,
    getRecordingStatus
} from "../../cameraManager";
import {getCameraFeedsCount} from "../../sql";

const get_status = async (ws: WebSocket, req: WsMessage) => {
    const recording_status = getRecordingStatus();
    const recording_duration = getRecordingDuration();
    const active_camera = getActiveCameraStreamsCount();
    const total_cameras = await getCameraFeedsCount();

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'get_status',
        data: {
            recording_status: recording_status,
            recording_duration: recording_duration,
            active_camera: active_camera,
            total_cameras: total_cameras
        }
    }
    ws.send(JSON.stringify(response));
}
export default get_status;