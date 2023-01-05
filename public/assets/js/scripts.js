let recordingStatus = {};
let cameraFeeds = [];
let previousStatus = null;
let previousTimeLimit = null;
let previousVideoFps = null;

alertify.set('notifier','position', 'top-right');

document.addEventListener('DOMContentLoaded', function() {
    const ppRecordBtn = document.querySelector("[data-pp-record-btn]");
    const stopRecordBtn = document.querySelector("[data-stop-record-btn]");
    const activeCameraCount = document.querySelector("[data-active-cameras-count]");
    const recordingDuration = document.querySelector("[data-recording-duration]");
    const cameraListItems = document.querySelector("[data-camera-list-items]");
    const timeLimitInput = document.querySelector("[data-time-limit-input]");
    const videoFpsInput = document.querySelector("[data-video-fps-input]");

    ppRecordBtn.addEventListener('click', function() {
        if (
            recordingStatus.status !== recordingStatuses.RUNNING &&
            recordingStatus.status !== recordingStatuses.PAUSED &&
            recordingStatus.status !== recordingStatuses.STOPPED
        ) return;

        if (recordingStatus.status === recordingStatuses.STOPPED){
            startRecording();
        }else if(recordingStatus.status === recordingStatuses.RUNNING){
            pauseRecording();
        }else if(recordingStatus.status === recordingStatuses.PAUSED){
            startRecording(false);
        }
    });
    stopRecordBtn.addEventListener('click', function() {
        if (
            recordingStatus.status === recordingStatuses.RUNNING ||
            recordingStatus.status === recordingStatuses.PAUSED
        ){
            stopRecording();
        }
    });
    timeLimitInput.addEventListener('change', function() {
        if (timeLimitInput.hasAttribute('disabled')) return;

        fetch('/api/settings/set?' + new URLSearchParams({key: 'timeLimit', value: parseInt(timeLimitInput.value)})).then((response) => response.json()).then((data) => {
            if (data.status === 'ok'){
                alertify.success('Tijdslimiet bijgewerkt');
            }else{
                alertify.error('Tijdslimiet bijwerken mislukt');
            }
        });
    });
    videoFpsInput.addEventListener('change', function() {
        if (videoFpsInput.hasAttribute('disabled')) return;

        fetch('/api/settings/set?' + new URLSearchParams({key: 'fps', value: parseInt(videoFpsInput.value)})).then((response) => response.json()).then((data) => {
            if (data.status === 'ok'){
                alertify.success('Video FPS bijgewerkt');
            }else{
                alertify.error('Video FPS bijwerken mislukt');
            }
        });
    });

    setInterval(function() {
        getApiStatus((status) => {
            if (JSON.stringify(previousStatus) !== JSON.stringify(status)) {
                previousStatus = status;
                if (status.status !== 'ok') {
                    alertify.error('API is not running!', 2);
                    return;
                } else {
                    alertify.success('Connected to API!', 2);
                }
            }

            disableOnRecord();
            getRecordingStatus();
            updateRecordingStatus();
            updateRecordingBtnState();
            getCameraFeedsAuto();
            getTimeLimit();
            getVideoFps();
            calculateVideoDuration();
        }).then(r => {});
    }, 300);

    const disableOnRecord = () => {
        const elements = document.querySelectorAll("[data-disable-on-record]");
        elements.forEach((element) => {
            if (
                recordingStatus.status === recordingStatuses.RUNNING ||
                recordingStatus.status === recordingStatuses.PAUSED
            ){
                element.setAttribute('disabled', 'disabled');
            }else{
                element.removeAttribute('disabled');
            }
        });
    }

    const getApiStatus = async (cb) => {
        await fetch('/api/status').then((response) => response.json()).then((data) => {
            cb(data);
        }).catch((error) => {
            cb({status: 'error'});
        });
    }

    const getTimeLimit = () => {
        fetch('/api/settings?' + new URLSearchParams({key: 'timeLimit'})).then((response) => response.json()).then((data) => {
            let timeLimit = data.value;
            if (timeLimit === null){
                timeLimit = 0;
            }

            if (previousTimeLimit !== timeLimit){
                previousTimeLimit = timeLimit;
                timeLimitInput.value = timeLimit;
            }
        });
    }

    const getVideoFps = () => {
        fetch('/api/settings?' + new URLSearchParams({key: 'fps'})).then((response) => response.json()).then((data) => {
            let videoFps = data.value;
            if (videoFps === null){
                videoFps = 24;
            }

            if (previousVideoFps !== videoFps){
                previousVideoFps = videoFps;
                videoFpsInput.value = videoFps;
            }
        });
    }

    const getRecordingStatus = () => {
        fetch('/api/recoding/status')
            .then(response => response.json())
            .then(data => {
                recordingStatus = data;
            });
    }

    const updateRecordingStatus = () => {
        if(recordingStatus.activeFeeds !== undefined && recordingStatus.activeFeeds !== null){
            activeCameraCount.textContent = recordingStatus.activeFeeds;
        }
        if(recordingStatus.duration !== undefined && recordingStatus.duration !== null){
            recordingDuration.textContent = secondsToHHMMSS(recordingStatus.duration);
        }
    }

    const updateRecordingBtnState = () => {
        if (
            recordingStatus.status !== recordingStatuses.RUNNING &&
            recordingStatus.status !== recordingStatuses.PAUSED &&
            recordingStatus.status !== recordingStatuses.STOPPED
        ) return;

        if (recordingStatus.status === recordingStatuses.STOPPED){
            ppRecordBtn.classList.add('btn-success');
            ppRecordBtn.classList.remove('btn-warning');
            ppRecordBtn.innerText = 'Opname Starten';
            stopRecordBtn.setAttribute('disabled', 'disabled');
        }else if(recordingStatus.status === recordingStatuses.RUNNING){
            ppRecordBtn.classList.add('btn-warning');
            ppRecordBtn.classList.remove('btn-success');
            ppRecordBtn.innerText = 'Opname Pauzeren';
            stopRecordBtn.removeAttribute('disabled');
        }else if(recordingStatus.status === recordingStatuses.PAUSED){
            ppRecordBtn.classList.add('btn-success');
            ppRecordBtn.classList.remove('btn-warning');
            ppRecordBtn.innerText = 'Opname Hervatten';
            stopRecordBtn.removeAttribute('disabled');
        }
    }

    const secondsToHHMMSS = (secs) => {
        let sec_num = parseInt(secs, 10)
        let hours   = Math.floor(sec_num / 3600)
        let minutes = Math.floor(sec_num / 60) % 60
        let seconds = sec_num % 60

        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":");
    }

    const secondsToHHMMSSMS = (secs) => {
        let pad = function(num, size) {
                return ('000' + num).slice(size * -1);
            },
            time = parseFloat(secs).toFixed(3),
            hours = Math.floor(time / 60 / 60),
            minutes = Math.floor(time / 60) % 60,
            seconds = Math.floor(time - minutes * 60),
            milliseconds = time.slice(-3);
        return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
    }

    const startRecording = (showWarning = true) => {
        if(showWarning){
            alertify.confirm('Opname Starten', `Het starten van de opnemen wist alle screenshots van de active cameras!`, function(){
                fetch('/api/recoding/start')
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'ok'){
                            alertify.notify('Opname Gestard', 'success');
                        }else{
                            alertify.notify('Opname Starten Mislukt', 'error');
                        }
                    });
            }, function(){
                alertify.error('Opname Starten Geannuleerd');
            }).set('labels', {ok:'Opname Starten', cancel:'Annuleren'});
        }else{
            fetch('/api/recoding/start')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok'){
                        alertify.notify('Opname Gestard', 'success');
                    }else{
                        alertify.notify('Opname Starten Mislukt', 'error');
                    }
                });
        }
    }

    const pauseRecording = () => {
        fetch('/api/recoding/pause')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Opname Gepauzeerd', 'success');
                }else{
                    alertify.notify('Opname Pauzeren Mislukt', 'error');
                }
            });
    }
    const stopRecording = () => {
        fetch('/api/recoding/stop')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Opname Gestopt', 'success');
                }else{
                    alertify.notify('Opname Stoppen Mislukt', 'error');
                }
            });
    }

    const calculateVideoDuration = () => {
        fetch('/api/cameras')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    let cameras = data.cameras;

                    const videoDurationElements = document.querySelectorAll("[data-video-duration]");
                    videoDurationElements.forEach((element) => {
                        let cameraId = parseInt(element.getAttribute('data-camera-id'));
                        let camera = cameras.find((camera) => camera.id === cameraId);
                        if (camera !== undefined){
                            let videoFps = videoFpsInput.value;
                            let interval = camera.interval;
                            let screenshotCount = recordingStatus.duration / interval;

                            if (camera.active !== 'true') return;

                            let videoDuration = screenshotCount / videoFps;
                            element.textContent = secondsToHHMMSSMS(videoDuration);
                        }
                    });
                }
            });
    }

    const getCameraListElement = (id, name, url, interval, active) => {
        return `
            <tr>
                <td class="row-name">
                    <input type="text" class="form-control" value="${name}" onchange="window.updateCameraName(${id}, this)" data-disable-on-record>
                </td>
                <td class="row-url">
                    <input type="text" class="form-control" value="${url}" onchange="window.updateCameraUrl(${id}, this)" data-disable-on-record>
                </td>
                <td class="row-interval">
                    <select class="form-select" onchange="window.updateCameraInterval(${id}, this)" data-disable-on-record>
                        <option value="2" ${interval === 2 ? 'selected' : ''}>Elke 2 sec</option>
                        <option value="5" ${interval === 5 ? 'selected' : ''}>Elke 5 sec</option>
                        <option value="10" ${interval === 10 ? 'selected' : ''}>Elke 10 sec</option>
                        <option value="15" ${interval === 15 ? 'selected' : ''}>Elke 15 sec</option>
                        <option value="20" ${interval === 20 ? 'selected' : ''}>Elke 20 sec</option>
                        <option value="25" ${interval === 25 ? 'selected' : ''}>Elke 25 sec</option>
                        <option value="30" ${interval === 30 ? 'selected' : ''}>Elke 30 sec</option>
                    </select>
                    <span><strong>Video Duur:</strong> <span data-video-duration data-camera-id="${id}">00:00:00.000</span></span>
                </td>
                <td class="row-active">
                    <label class="switch">
                        <input type="checkbox" ${active === 'true' ? 'checked' : ''} onchange="window.updateCameraActive(${id}, this)" data-disable-on-record>
                        <span class="slider round"></span>
                    </label>
                </td>
                <td class="camera-actions">
                    <div class="download-btn" onclick="window.downloadVideo(${id}, '${name}')" data-disable-on-record><i class="fas fa-download"></i></div>
                    <div class="delete-btn" onclick="window.deleteCamera(${id}, '${name}')" data-delete-camera-id="${id}" data-disable-on-record><i class="far fa-trash-alt"></i></div>
                </td>
            </tr>
        `;
    }

    const getCameraItems = () => {
        fetch('/api/cameras')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    let cameras = data.cameras;
                    cameraListItems.innerHTML = '';
                    cameras.forEach(camera => {
                        cameraListItems.innerHTML += getCameraListElement(camera.id, camera.name, camera.url, camera.interval, camera.active);
                    });
                }
            });
    }

    const getCameraFeedsAuto = () => {
        fetch('/api/cameras')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    let cameras = data.cameras;
                    if (JSON.stringify(cameraFeeds) !== JSON.stringify(cameras)){
                        cameraFeeds = cameras;
                        getCameraItems();
                    }
                }
            });
    }

    window.addCameraFeed = () => {
        if (timeLimitInput.hasAttribute('disabled')) return;

        const cameraAddNameInput = document.querySelector("[data-camera-add-name-input]");
        const cameraAddUrlInput = document.querySelector("[data-camera-add-url-input]");
        const cameraAddIntervalInput = document.querySelector("[data-camera-add-interval-input]");
        const cameraAddActiveInput = document.querySelector("[data-camera-add-active-input]");

        let hasError = false;
        if(cameraAddNameInput.value.length === 0){
            alertify.error('Camera naam is verplicht!');
            cameraAddNameInput.classList.add('is-invalid');
            hasError = true;
        }
        cameraFeeds.forEach(camera => {
            if (camera.name === cameraAddNameInput.value){
                alertify.error('Camera naam bestaat al!');
                cameraAddNameInput.classList.add('is-invalid');
                hasError = true;
            }
        });
        if(cameraAddUrlInput.value.length === 0){
            alertify.error('Camera url is verplicht!');
            cameraAddUrlInput.classList.add('is-invalid');
            hasError = true;
        }
        if(cameraAddUrlInput.value.startsWith('rtsp://') === false && cameraAddUrlInput.value.startsWith('rtsps://') === false){
            alertify.error('Camera url moet beginnen met "rtsp://"!');
            cameraAddUrlInput.classList.add('is-invalid');
            hasError = true;
        }
        cameraFeeds.forEach(camera => {
            if (camera.url === cameraAddUrlInput.value){
                alertify.error('Camera url bestaat al!');
                cameraAddUrlInput.classList.add('is-invalid');
                hasError = true;
            }
        });
        if(cameraAddIntervalInput.value.length === 0){
            alertify.error('Camera interval is verplicht!');
            cameraAddIntervalInput.classList.add('is-invalid');
            hasError = true;
        }
        if (hasError) return;

        let jsonData = {
            name: cameraAddNameInput.value,
            url: cameraAddUrlInput.value,
            interval: cameraAddIntervalInput.value,
            active: cameraAddActiveInput.checked
        }
        let base64String = btoa(JSON.stringify(jsonData));
        fetch('/api/cameras/add?' + new URLSearchParams({data: base64String}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Camera Toegevoegd', 'success');
                    cameraAddNameInput.value = '';
                    cameraAddUrlInput.value = '';
                    cameraAddIntervalInput.value = 2;
                    cameraAddActiveInput.checked = false;
                }else{
                    alertify.notify('Camera Toevoegen Mislukt', 'error');
                }
            });
    }

    window.updateCameraName = (id, input) => {
        if (input.hasAttribute('disabled')) return;

        let value = input.value;

        let hasError = false;
        if(value.length === 0){
            alertify.error('Camera naam is verplicht!');
            input.classList.add('is-invalid');
            hasError = true;
        }
        cameraFeeds.forEach(camera => {
            if (camera.name === value){
                alertify.error('Camera naam bestaat al!');
                input.classList.add('is-invalid');
                hasError = true;
            }
        });
        if (hasError) {
            input.value = cameraFeeds.find(camera => camera.id === id).name;
            return;
        }

        fetch(`/api/cameras/update?` + new URLSearchParams({id: id, key: 'name', value: btoa(value)}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Camera naam Aangepast', 'success');
                }else{
                    alertify.notify('Camera naam Aanpassen Mislukt', 'error');
                }
            });
    };
    window.updateCameraUrl = (id, input) => {
        if (input.hasAttribute('disabled')) return;

        let value = input.value;

        let hasError = false;
        if(value.length === 0){
            alertify.error('Camera url is verplicht!');
            input.classList.add('is-invalid');
            hasError = true;
        }
        if(value.startsWith('rtsp://') === false && value.startsWith('rtsps://') === false){
            alertify.error('Camera url moet beginnen met "rtsp://"!');
            input.classList.add('is-invalid');
            hasError = true;
        }
        cameraFeeds.forEach(camera => {
            if (camera.url === value){
                alertify.error('Camera url bestaat al!');
                input.classList.add('is-invalid');
                hasError = true;
            }
        });
        if (hasError) {
            input.value = cameraFeeds.find(camera => camera.id === id).url;
            return;
        }

        fetch(`/api/cameras/update?` + new URLSearchParams({id: id, key: 'url', value: btoa(value)}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Camera url Aangepast', 'success');
                }else{
                    alertify.notify('Camera url Aanpassen Mislukt', 'error');
                }
            });
    };
    window.updateCameraInterval = (id, input) => {
        if (input.hasAttribute('disabled')) return;

        let value = input.value;

        let hasError = false;
        if(value.length === 0){
            alertify.error('Camera interval is verplicht!');
            input.classList.add('is-invalid');
            hasError = true;
        }
        if (hasError) return;

        fetch(`/api/cameras/update?` + new URLSearchParams({id: id, key: 'interval', value: btoa(value)}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Camera interval Aangepast', 'success');
                }else{
                    alertify.notify('Camera interval Aanpassen Mislukt', 'error');
                }
            });
    };
    window.updateCameraActive = (id, input) => {
        if (input.hasAttribute('disabled')) return;

        let value = input.checked;

        fetch(`/api/cameras/update?` + new URLSearchParams({id: id, key: 'active', value: btoa(value)}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok'){
                    alertify.notify('Camera actief Aangepast', 'success');
                }else{
                    alertify.notify('Camera actief Aanpassen Mislukt', 'error');
                }
            });
    };
    window.deleteCamera = (id, name) => {
        let deleteBtn = document.querySelector('[data-delete-camera-id="' + id + '"]');
        if (deleteBtn.hasAttribute('disabled')) return;

        alertify.confirm('Delete Camera', `Weet je zeker dat je <strong>${name}</strong> wilt verwijderen.`, function(){
            fetch(`/api/cameras/delete?` + new URLSearchParams({id: id}))
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok'){
                        alertify.notify('Camera Verwijderd', 'success');
                    }else{
                        alertify.notify('Camera Verwijderen Mislukt', 'error');
                    }
                });
        }, function(){
            alertify.error('Verwijderen Geannuleerd');
        }).set('labels', {ok:'Verwijderen', cancel:'Annuleren'});
    }

    window.downloadVideo = (videoId, name) => {
        fetch(`/api/video/dates?` + new URLSearchParams({id: videoId}))
            .then(response => response.json())
            .then(data => {
                let dates = data.dates;

                let html = '<p>Selecteer een datum:</p>';
                html += '<ul class="list-group">';
                dates.forEach(date => {
                    html += `<li class="list-group-item list-group-item-action" onclick="window.downloadVideoDate('${videoId}', '${date}')">${date}</li>`
                });
                html += '</ul>';

                alertify.alert()
                    .setting({
                        'label':'Sluiten',
                        'title': 'Genereer Video',
                        'message': html,
                    }).show();
            });
    }
    window.downloadVideoDate = (videoId, date) => {
        alertify.alert().close();

        fetch(`/api/video/generate?` + new URLSearchParams({id: videoId, date: date}))
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    alertify.notify('Video Genereren', 'success');
                }else{
                    alertify.notify('Video Genereren Mislukt', 'error');
                }
            });

        let interval = setInterval(() => {
            fetch(`/api/video/status?` + new URLSearchParams({id: videoId, date: date}))
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alertify.alert()
                            .setting({
                                'label':'Sluiten',
                                'title': 'Download Video',
                                'message': `
                                    <h1>Video is klaar!</h1>
                                    <a href="/api/video/download?` + new URLSearchParams({id: videoId, date: date}) + `" target="_blank" class="btn btn-primary">Download</a>
                                `,
                            }).show();
                        clearInterval(interval);
                    }else if(data.status === 'error'){
                        alertify.alert()
                            .setting({
                                'label':'Sluiten',
                                'title': 'Download Video',
                                'message': `
                                    <h1>Video genereren mislukt!</h1>
                                    <p>${data.message}</p>
                                `,
                            }).show();
                        clearInterval(interval);
                    }
                });
        }, 1000);

    }
}, false);