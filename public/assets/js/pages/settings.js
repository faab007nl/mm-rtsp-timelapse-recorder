import {requestSettings, restartNode, restartServer, updateVideoExportFps} from "../ws_handlers/settings.js";

export const settingsInit = () => {
    const videoExportInput = document.querySelector('[data-settings-video-export-fps-input]');

    requestSettings();

    videoExportInput.addEventListener('change', (e) => {
        updateVideoExportFps(e.target, e.target.value);
    });

    const restartNodeBtn = document.querySelector('[data-settings-restart-node-btn]');
    const restartNodeCloseBtn = document.querySelector('[data-settings-restart-node-close-btn]');
    const restartServerBtn = document.querySelector('[data-settings-restart-server-btn]');
    const restartServerCloseBtn = document.querySelector('[data-settings-restart-server-close-btn]');
    restartNodeBtn.addEventListener('click', () => {
        restartNode();
        restartNodeCloseBtn.click();
    });
    restartServerBtn.addEventListener('click', () => {
        restartServer();
        restartServerCloseBtn.click();
    });
}