import {
    requestRecordings,
} from "../ws_handlers/recordings.js";

export const recordingInit = () => {
    setInterval(() => {

    }, 500);
    setInterval(() => {
        requestRecordings();
    }, 1000);
}