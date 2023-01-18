import {addCamera} from "./ws_handlers/cameras.js";

export const addCameraFormInit = () => {
    const addCameraNameInput = document.querySelector('[data-add-camera-name-input]');
    const addCameraIntervalInput = document.querySelector('[data-add-camera-interval-input]');
    const addCameraUrlInput = document.querySelector('[data-add-camera-url-input]');
    const addCameraBtn = document.querySelector('[data-add-camera-btn]');
    const addCameraErrorsDiv = document.querySelector('[data-add-camera-errors-div]');
    const addCameraCloseBtn = document.querySelector('[data-add-camera-close-btn]');

    addCameraBtn.addEventListener('click', () => {
        const cameraName = addCameraNameInput.value;
        const cameraInterval = addCameraIntervalInput.value;
        const cameraUrl = addCameraUrlInput.value;
        let hasError = false;

        addCameraErrorsDiv.innerHTML = '';
        if(cameraName.length === 0) {
            addCameraNameInput.classList.add('is-invalid');
            let error = document.createElement('div');
            error.classList.add('alert', 'alert-danger');
            error.innerText = 'Camera name is required';
            addCameraErrorsDiv.appendChild(error);
            hasError = true;
        }else{
            addCameraNameInput.classList.remove('is-invalid');
        }
        if(cameraInterval <= 0) {
            addCameraIntervalInput.classList.add('is-invalid');
            let error = document.createElement('div');
            error.classList.add('alert', 'alert-danger');
            error.innerText = 'Camera interval must be greater than 0';
            addCameraErrorsDiv.appendChild(error);
            hasError = true;
        }else{
            addCameraIntervalInput.classList.remove('is-invalid');
        }
        if(cameraUrl.length === 0) {
            addCameraUrlInput.classList.add('is-invalid');
            let error = document.createElement('div');
            error.classList.add('alert', 'alert-danger');
            error.innerText = 'Camera url is required';
            addCameraErrorsDiv.appendChild(error);
            hasError = true;
        }else{
            addCameraUrlInput.classList.remove('is-invalid');
        }
        if(!cameraUrl.startsWith('rtsp://') && !cameraUrl.startsWith('rtsps://')) {
            addCameraUrlInput.classList.add('is-invalid');
            let error = document.createElement('div');
            error.classList.add('alert', 'alert-danger');
            error.innerText = 'Camera url must start with rtsp:// or rtsps://';
            addCameraErrorsDiv.appendChild(error);
            hasError = true;
        }else{
            addCameraUrlInput.classList.remove('is-invalid');
        }

        if(hasError){
            return;
        }

        addCameraNameInput.value = '';
        addCameraUrlInput.value = '';
        addCameraIntervalInput.value = '1';

        addCameraCloseBtn.click();

        addCamera(cameraName, cameraUrl, cameraInterval);
    });
}