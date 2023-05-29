
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

        let activeFromMinutes = camera.activeFrom % 60;
        let activeFromHours = (camera.activeFrom - activeFromMinutes) / 60;
        let activeFrom = `${activeFromHours < 10 ? `0${activeFromHours}` : activeFromHours}:${activeFromMinutes < 10 ? `0${activeFromMinutes}` : activeFromMinutes}`;

        let activeToMinutes = camera.activeTo % 60;
        let activeToHours = (camera.activeTo - activeToMinutes) / 60;
        let activeTo = `${activeToHours < 10 ? `0${activeToHours}` : activeToHours}:${activeToMinutes < 10 ? `0${activeToMinutes}` : activeToMinutes}`;

        row.innerHTML = `
          <td>${camera.id}</td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.name}" data-edit-camera-name-input ${camera.active || camera.disabled ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label class="w-full">
              <input type="text" class="form-control w-full" value="${camera.url}" data-edit-camera-url-input ${camera.active || camera.disabled ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label>
              <input type="number" class="form-control w-full" value="${camera.interval}" data-edit-camera-interval-input ${camera.active || camera.disabled ? "disabled" : ""}>
            </label>
          </td>
          <td>
            van
            <label>
              <input type="time" class="form-control w-full" value="${activeFrom}" data-edit-camera-active-from-input ${camera.active || camera.disabled ? "disabled" : ""}>
            </label>
            tot
            <label>
              <input type="time" class="form-control w-full" value="${activeTo}" data-edit-camera-active-to-input ${camera.active || camera.disabled ? "disabled" : ""}>
            </label>
          </td>
          <td>
            <label class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${camera.active ? "checked" : ""} ${camera.disabled ? "disabled" : ""} data-edit-camera-active-input>
            </label>
          </td>
          <td>
            <div class="d-flex gap-2">
              <div ${!camera.active && !camera.disabled ? `data-bs-toggle="modal" data-bs-target="#delete-camera-model-${camera.id}"` : ""}>
                <div class="delete-btn fs-1 ${camera.active || camera.disabled ? "btn-disabled" : ""}">
                  <i class="fa-solid fa-trash"></i>
                </div>
              </div>
            </div>
          </td>
       `;
        cameraListDiv.appendChild(row);

        if(!camera.active && !camera.disabled) {
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