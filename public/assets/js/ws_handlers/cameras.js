
export const handleCameraAction = (action, data) => {
    console.log('handleCameraAction >', action, data);

    switch (action) {
        case 'list':
            renderCameraList(data);
            break;
        case 'added':
            alertify.notify('Camera Added', 'success', 2);
            requestCameraList();
            break;
        case 'deleted':
            alertify.notify('Camera Deleted', 'success', 2);
            requestCameraList();
            break;
        case 'updated':
            alertify.notify('Camera Updated', 'success', 2);
            requestCameraList();
            break;
        case 'activated':
            alertify.notify('Camera Activated', 'success', 2);
            requestCameraList();
            break;
        case 'deactivated':
            alertify.notify('Camera Deactivated', 'success', 2);
            requestCameraList();
            break;
    }
}

export const requestCameraList = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'list',
        data: {}
    }));
}

const renderCameraList = (data) => {
    const cameraListDiv = document.querySelector('[data-camera-list]');
    const camerasCount = document.querySelector('[data-cameras-count]');
    const cameraModelsDiv = document.querySelector('[data-camera-models-div]');

    if(cameraListDiv === null) return;

    let cameras = data.cameras;

    cameraListDiv.innerHTML = '';
    cameraModelsDiv.innerHTML = '';
    camerasCount.innerText = cameras.length;

    cameras.forEach(camera => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${camera.id}</td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.name}" data-edit-camera-name-input ${camera.active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.url}" data-edit-camera-url-input ${camera.active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label class="w-full">
              <input type="number" min="1" max="59" class="form-control w-full" value="${camera.interval}"  data-edit-camera-interval-input ${camera.active ? "disabled" : ""}>
            </label>
          </td>
          <td class="d-flex gap-2">
            <div data-bs-toggle="modal" data-bs-target="#view-camera-model-${camera.id}">
              <div class="view-camera-btn fs-1">
                <i class="fa-solid fa-video"></i>
              </div>
            </div>
          </td>
          <td>
            <label class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${camera.active ? "checked" : ""} data-edit-camera-active-input>
            </label>
          </td>
          <td class="d-flex gap-2">
            <div data-bs-toggle="modal" data-bs-target="#delete-camera-model-${camera.id}">
              <div class="delete-btn fs-1">
                <i class="fa-solid fa-trash"></i>
              </div>
            </div>
          </td>
       `;
        cameraListDiv.appendChild(row);

        const deleteModelDiv = document.createElement('div');
        deleteModelDiv.classList.add('modal', 'modal-blur');
        deleteModelDiv.setAttribute('id', `delete-camera-model-${camera.id}`);
        deleteModelDiv.innerHTML = `
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Camera Verwijderen</h5>
              </div>
              <div class="modal-body">
                <h2>Weet u zeker dat je ${camera.name} wilt verwijderen?</h2>
                <p>Deze actie is niet meer terug te draaien!</p>
              </div>
              <div class="modal-footer">
                <div class="btn btn-primary" data-bs-dismiss="modal">
                  Annuleren
                </div>
                <div
                    class="btn btn-danger ms-auto d-flex gap-1" 
                    data-bs-dismiss="modal"
                    data-camera-id="${camera.id}"
                    data-delete-camera
                >
                  <i class="fa-solid fa-trash"></i>
                  Verwijderen
                </div>
              </div>
            </div>
          </div>
        `;
        cameraModelsDiv.appendChild(deleteModelDiv);

        const viewModelDiv = document.createElement('div');
        viewModelDiv.classList.add('modal', 'modal-blur');
        viewModelDiv.setAttribute('id', `view-camera-model-${camera.id}`);
        viewModelDiv.innerHTML = `
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Stream Bekijken - ${camera.name}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="video-container">
                    <div class="video-error hidden" data-view-camera-error-div-${camera.id}>
                        <i class="fa-solid fa-circle-exclamation"></i>
                        <span data-view-camera-error-msg-${camera.id}>Unknown Error</span>
                    </div>
                
                    <div class="video-loader" data-video-loader-${camera.id}>
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>Loading Camera...</span>
                    </div>
                    
                    <div id="camera-wrapper-${camera.wsPort}" class="view-camera-video hidden"></div>
                </div>
              </div>
            </div>
          </div>
        `;
        cameraModelsDiv.appendChild(viewModelDiv);

        const viewCameraErrorDiv = viewModelDiv.querySelector(`[data-view-camera-error-div-${camera.id}]`);
        const viewCameraErrorMsgDiv = viewModelDiv.querySelector(`[data-view-camera-error-msg-${camera.id}]`);
        const videoLoaderDiv = viewModelDiv.querySelector(`[data-video-loader-${camera.id}]`);
        const videoCanvas = viewModelDiv.querySelector(`#camera-wrapper-${camera.wsPort}`);

        let JsMpegPlayer = null;

        if(camera.active){
            let errorTimeout = setTimeout(() => {
                viewCameraErrorDiv.classList.remove('hidden');
                viewCameraErrorMsgDiv.innerText = 'Camera is offline';
                videoLoaderDiv.classList.add('hidden');
            }, 2000);

            viewModelDiv.addEventListener('show.bs.modal', () => {
                JsMpegPlayer = new JSMpeg.VideoElement(
                    videoCanvas,
                    `ws://${window.config.ws_host}:${camera.wsPort}/stream`,
                    {
                        hooks: {
                            load: () => {
                                videoLoaderDiv.classList.add('hidden');
                                viewCameraErrorDiv.classList.add('hidden');
                                videoCanvas.classList.remove('hidden');
                                clearTimeout(errorTimeout);
                            }
                        }
                    }
                );
            });
            viewModelDiv.addEventListener('hidden.bs.modal', () => {
                if(JsMpegPlayer !== undefined && JsMpegPlayer !== null) {
                    JsMpegPlayer.destroy();
                }
            });
        }else{
            viewCameraErrorDiv.classList.remove('hidden');
            viewCameraErrorMsgDiv.innerText = 'De camera is op dit moment niet actief';
            videoLoaderDiv.classList.add('hidden');
        }
    });

    const deleteCameraBtns = document.querySelectorAll('[data-delete-camera]');
    deleteCameraBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cameraId = btn.getAttribute('data-camera-id');
            deleteCamera(cameraId);
        });
    });

    const editCameraNameInputs = document.querySelectorAll('[data-edit-camera-name-input]');
    editCameraNameInputs.forEach(input => {
        input.addEventListener('change', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraName = input.value;
            if(cameraName.length === 0){
                alertify.notify('Camera naam mag niet leeg zijn', 'error', 2);
                return;
            }
            updateCamera(cameraId, cameraName, null, null, null);
        });
    });

    const editCameraUrlInputs = document.querySelectorAll('[data-edit-camera-url-input]');
    editCameraUrlInputs.forEach(input => {
        input.addEventListener('change', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraUrl = input.value;
            if(cameraUrl.length === 0){
                alertify.notify('Camera url mag niet leeg zijn', 'error', 2);
                return;
            }
            if(!cameraUrl.startsWith('rtsp://') && !cameraUrl.startsWith('rtsps://')) {
                alertify.notify('Camera url must start with rtsp:// or rtsps://', 'error', 2);
                return;
            }
            updateCamera(cameraId, null, cameraUrl, null, null);
        });
    });

    const editCameraIntervalInputs = document.querySelectorAll('[data-edit-camera-interval-input]');
    editCameraIntervalInputs.forEach(input => {
        input.addEventListener('change', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraInterval = input.value;
            if(cameraInterval.length === 0){
                alertify.notify('Camera url mag niet leeg zijn', 'error', 2);
                return;
            }
            updateCamera(cameraId, null, null, cameraInterval);
        });
    });

    const editCameraActiveInputs = document.querySelectorAll('[data-edit-camera-active-input]');
    editCameraActiveInputs.forEach(input => {
        input.addEventListener('change', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraActive = input.checked;
            if(cameraActive !== true && cameraActive !== false){
                alertify.notify('Camera active moet true of false zijn', 'error', 2);
                return;
            }
            setActive(cameraId, cameraActive);
        });
    });
}

export const addCamera = (
    name,
    url,
    interval,
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'add',
        data: {
            name,
            url,
            interval,
        }
    }));
}

export const updateCamera = (
    id,
    name,
    url,
    interval,
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'edit',
        data: {
            id,
            name,
            url,
            interval,
        }
    }));
}

export const setActive = (
    id,
    active
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'active',
        data: {
            id,
            active
        }
    }));
}

export const deleteCamera = (
    id
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'del',
        data: {
            id
        }
    }));
}