import * as WebSocket from "ws";
import {Recording, WsMessage, WsResponse} from "../../include/interfaces";
import {getServerUUID} from "../../index";
import {getRecordings} from "../../sql";
import {RecordingVideoStatus} from "../../include/enums";

const recordings = async (ws: WebSocket, req: WsMessage) => {
    let recordings: Recording[] = await getRecordings();

    recordings.forEach((recording: Recording) => {
        recording.video_status = RecordingVideoStatus.NO_VIDEO;
    });

    let response: WsResponse = {
        from: getServerUUID(),
        to: req.from,
        category: 'home',
        action: 'recordings',
        data: {
            recordings: recordings
        }
    }
    ws.send(JSON.stringify(response));
}

export default recordings;