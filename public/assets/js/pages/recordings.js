import {
    requestRecordings,
} from "../ws_handlers/recordings.js";

export const recordingInit = () => {
    requestRecordings();
    setInterval(() => {
        requestRecordings();
    }, 5000);
}