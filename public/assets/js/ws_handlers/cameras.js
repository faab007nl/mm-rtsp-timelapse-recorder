
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
        case 'recordingStarted':
            alertify.notify('Recording Started', 'success', 2);
            requestCameraList();
            break;
        case 'recordingStopped':
            alertify.notify('Recording Stopped', 'success', 2);
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

        let activeFromMinutes = camera.activeFrom % 60;
        let activeFromHours = (camera.activeFrom - activeFromMinutes) / 60;
        let activeFrom = `${activeFromHours < 10 ? `0${activeFromHours}` : activeFromHours}:${activeFromMinutes < 10 ? `0${activeFromMinutes}` : activeFromMinutes}`;

        let activeToMinutes = camera.activeTo % 60;
        let activeToHours = (camera.activeTo - activeToMinutes) / 60;
        let activeTo = `${activeToHours < 10 ? `0${activeToHours}` : activeToHours}:${activeToMinutes < 10 ? `0${activeToMinutes}` : activeToMinutes}`;

        let active = camera.currentRecordingId !== undefined && camera.currentRecordingId !== null;

        row.innerHTML = `
          <td>${camera.id}</td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.name}" data-edit-camera-name-input ${active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.url}" data-edit-camera-url-input ${active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label>
              <input type="number" class="form-control w-full" value="${camera.interval}" data-edit-camera-interval-input ${active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            van
            <label>
              <input type="time" class="form-control w-full" value="${activeFrom}" data-edit-camera-active-from-input ${active ? "disabled" : ""}>
            </label>
            tot
            <label>
              <input type="time" class="form-control w-full" value="${activeTo}" data-edit-camera-active-to-input ${active ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <div 
                class="btn btn-success d-none d-sm-inline-block d-flex gap-1 ${active ? "hidden" : ""}" 
                data-bs-toggle="modal" data-bs-target="#activate-camera-model-${camera.id}"
            >
              Opname Starten
            </div>
            <div 
                class="btn btn-danger d-none d-sm-inline-block d-flex gap-1 ${!active ? "hidden" : ""}"
                data-bs-toggle="modal" data-bs-target="#deactivate-camera-model-${camera.id}"
            >
              Opname Stoppen
            </div>
          </td>
          <td>
            <div class="d-flex gap-2">
              <div ${!active ? `data-bs-toggle="modal" data-bs-target="#delete-camera-model-${camera.id}"` : ""}>
                <div class="delete-btn fs-1 ${active ? "btn-disabled" : ""}">
                  <i class="fa-solid fa-trash"></i>
                </div>
              </div>
            </div>
          </td>
       `;
        cameraListDiv.appendChild(row);

        if(!active) {
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
        }

        const activateModelDiv = document.createElement('div');
        activateModelDiv.classList.add('modal', 'modal-blur');
        activateModelDiv.setAttribute('id', `activate-camera-model-${camera.id}`);
        activateModelDiv.innerHTML = `
              <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Opname voor <strong>${camera.name}</strong> starten</h5>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                        <label>Opname naam:</label>
                        <input type="text" class="form-control w-full">
                    </div>
                  </div>
                  <div class="modal-footer">
                    <div class="btn btn-primary" data-bs-dismiss="modal">
                      Annuleren
                    </div>
                    <div
                        class="btn btn-success ms-auto d-flex gap-1" 
                        data-bs-dismiss="modal"
                        data-camera-id="${camera.id}"
                        data-edit-camera-activate-btn
                    >
                      Opname Starten
                    </div>
                  </div>
                </div>
              </div>
            `;
        cameraModelsDiv.appendChild(activateModelDiv);

        const deactivateModelDiv = document.createElement('div');
        deactivateModelDiv.classList.add('modal', 'modal-blur');
        deactivateModelDiv.setAttribute('id', `deactivate-camera-model-${camera.id}`);
        deactivateModelDiv.innerHTML = `
              <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Opname voor <strong>${camera.name}</strong> stoppen</h5>
                  </div>
                  <div class="modal-body">
                    Weet je zeker dat je de opname voor <strong>${camera.name}</strong> wilt stoppen?
                  </div>
                  <div class="modal-footer">
                    <div class="btn btn-primary" data-bs-dismiss="modal">
                      Annuleren
                    </div>
                    <div
                        class="btn btn-danger ms-auto d-flex gap-1" 
                        data-bs-dismiss="modal"
                        data-camera-id="${camera.id}"
                        data-edit-camera-deactivate-btn
                    >
                      Opname Stoppen
                    </div>
                  </div>
                </div>
              </div>
            `;
        cameraModelsDiv.appendChild(deactivateModelDiv);
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
            updateCamera(cameraId, cameraName, null, null, null, null);
        });
    });

    const editCameraUrlInputs = document.querySelectorAll('[data-edit-camera-url-input]');
    editCameraUrlInputs.forEach(input => {
        input.addEventListener('blur', () => {
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
            updateCamera(cameraId, null, cameraUrl, null, null, null);
        });
    });

    const editCameraIntervalInputs = document.querySelectorAll('[data-edit-camera-interval-input]');
    editCameraIntervalInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraInterval = input.value;
            if(cameraInterval.length === 0){
                alertify.notify('Camera interval mag niet leeg zijn', 'error', 2);
                return;
            }
            if (cameraInterval < 1) {
                alertify.notify('Camera interval moet minimaal 1 minuut zijn', 'error', 2);
                return;
            }
            updateCamera(cameraId, null, null, cameraInterval, null, null);
        });
    });

    const editCameraActiveFromInputs = document.querySelectorAll('[data-edit-camera-active-from-input]');
    editCameraActiveFromInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraActiveFrom = input.value;
            if(cameraActiveFrom.length === 0){
                alertify.notify('Camera actief van tijd mag niet leeg zijn', 'error', 2);
                return;
            }
            updateCamera(cameraId, null, null, null, cameraActiveFrom, null);
        });
    });

    const editCameraActiveToInputs = document.querySelectorAll('[data-edit-camera-active-to-input]');
    editCameraActiveToInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const cameraId = input.closest('tr').querySelector('td').innerText;
            const cameraActiveTo = input.value;
            if(cameraActiveTo.length === 0){
                alertify.notify('Camera actief tot tijd mag niet leeg zijn', 'error', 2);
                return;
            }
            updateCamera(cameraId, null, null, null, null, cameraActiveTo);
        });
    });

    const editCameraActivateInputs = document.querySelectorAll('[data-edit-camera-activate-btn]');
    editCameraActivateInputs.forEach(input => {
        input.addEventListener('click', () => {
            const cameraId = input.getAttribute('data-camera-id');
            const recordingName = input.closest('.modal').querySelector('input').value;
            activateCamera(cameraId, recordingName);
        });
    });

    const editCameraDeactivateInputs = document.querySelectorAll('[data-edit-camera-deactivate-btn]');
    editCameraDeactivateInputs.forEach(input => {
        input.addEventListener('click', () => {
            const cameraId = input.getAttribute('data-camera-id');
            deactivateCamera(cameraId);
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
    activeFrom,
    activeTo,
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
            activeFrom,
            activeTo,
        }
    }));
}

export const activateCamera = (
    id,
    recordingName
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'activate',
        data: {
            id,
            recordingName
        }
    }));
}

export const deactivateCamera = (
    id
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'camera',
        action: 'deactivate',
        data: {
            id
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