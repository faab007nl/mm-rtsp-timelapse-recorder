import {
    requestStatus,
    requestMaxRecordingDuration, setMaxRecordingDuration,
    startRecording,
    stopRecording,
    requestRecordings,
} from "../ws_handlers/home.js";

export const homeInit = () => {
    const startRecordingBtn = document.querySelector('[data-start-recording]');
    const stopRecordingBtn = document.querySelector('[data-stop-recording]');
    const maxRecordingDurationInput = document.querySelector('[data-max-recording-duration-input]');

    startRecordingBtn.addEventListener('click', () => {
        startRecording();
    });
    stopRecordingBtn.addEventListener('click', () => {
        stopRecording();
    });
    maxRecordingDurationInput.addEventListener('change', () => {
        setMaxRecordingDuration(maxRecordingDurationInput.value);
    });

    setInterval(() => {
        requestStatus();
    }, 500);
    setInterval(() => {
        requestRecordings();
    }, 1000);
    requestMaxRecordingDuration();
}