export const handleRecordingsAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Connection Ready', 'success', 2);
            break;
        case "list":
            updateRecordings(data);
            break;
        case "delete":
            alertify.notify('Recording verwijderd', 'success', 2);
            requestRecordings();
            break;
    }
}

const updateRecordings = (data) => {
    const recordingsContainer = document.querySelector('[data-recordings-container]');
    const homeModelContainer = document.querySelector('[data-home-model-container]');

    let recordings = data.recordings.reverse();
    recordingsContainer.innerHTML = '';

    if(recordings.length === 0) {
        recordingsContainer.innerHTML = '<p class="text-center">Er zijn nog geen opnames</p>';
    }

    recordings.forEach(recording => {
        const row = document.createElement('div');
        row.classList.add('row');

        let startedDateText = moment(recording.started).format('DD-MM-YYYY h:mm:ss');
        let startedAgoText = "";
        let endedDateText = "";
        let active = false;
        let videoGenerated = recording.videoGenerated === 1;

        if(recording.ended === null) {
            startedAgoText = `(gestart ${moment(recording.started).fromNow()})`;
            active = true;
        }else{
            endedDateText = moment(recording.ended).format('DD-MM-YYYY h:mm:ss');
        }

        row.innerHTML = `
            <div class="col-auto">
                <span class="avatar bg-info">
                    <i class="fa-solid fa-video text-white"></i>
                </span>
            </div>
            <div class="col">
                <div>
                    ${recording.name}
                    <span
                        class="badge data-tooltip"
                    >
                        <span class="data-tooltip-text" data-right>Aantal Screenshots</span>
                        <i class="fa-solid fa-camera text-white me-1"></i>
                        ${recording.screenshotCount}
                    </span>
                </div>
                <div class="text-muted">
                    <strong>started:</strong> ${startedDateText} ${startedAgoText}
                    ${endedDateText.length > 0 ? `<strong>ended:</strong> ${endedDateText}` : ''}
                </div>
            </div>
            <div class="col-auto d-flex gap-3 fs-1">
                <div ${!active && !videoGenerated ? `data-bs-toggle="modal" data-bs-target="#generate-recording-model-${recording.id}"` : ""}>
                    <div class="video-btn ${active || videoGenerated ? "btn-disabled" : ""}">
                        <i class="fa-solid fa-file-video"></i>
                    </div>
                </div>
                <div ${!active && !videoGenerated ? `data-bs-toggle="modal" data-bs-target="#view-recording-model-${recording.id}"` : ""}>
                    <div class="video-btn ${!active && videoGenerated ? "btn-disabled" : ""}btn-disabled">
                        <i class="fa-solid fa-eye"></i>
                    </div>
                </div>
                <div ${!active ? `data-bs-toggle="modal" data-bs-target="#delete-recording-model-${recording.id}"` : ""}>
                    <div class="delete-btn fs-1 ${active ? "btn-disabled" : ""}">
                      <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
        recordingsContainer.append(row);

        const generateVideoModel = document.createElement('div');
        generateVideoModel.classList.add('modal', 'modal-blur');
        generateVideoModel.setAttribute('id', `generate-recording-model-${recording.id}`);
        generateVideoModel.innerHTML = `
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Video Genereren</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="d-flex gap-2 align-items-center mb-2">
                    <div class="progress">
                      <div class="progress-bar" data-progress-bar-${recording.id} style="width: 0;" role="progressbar">
                      </div>
                    </div>
                    <span class="w-4">0%</span>
                </div>
                <div class="w-full d-flex justify-content-end">
                  <div class="btn btn-primary" data-generate-video-${recording.id}>
                    Genereer Videos
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        homeModelContainer.append(generateVideoModel);

        const viewVideoModel = document.createElement('div');
        viewVideoModel.classList.add('modal', 'modal-blur');
        viewVideoModel.setAttribute('id', `view-recording-model-${recording.id}`);
        viewVideoModel.innerHTML = `
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Video Bekijken</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <video
                    id="video-player-${recording.id}"
                    controls
                    preload="auto"
                    width="100%"
                >
                    <source src="/api/recordings/${recording.id}/video" type="video/mp4" />
                    <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                </video>
                <a href="/api/recordings/${recording.id}/download" target="_blank" class="btn btn-primary w-100">
                    Download Video
                </a>
              </div>
            </div>
          </div>
        `;
        homeModelContainer.append(viewVideoModel);

        const deleteModelDiv = document.createElement('div');
        deleteModelDiv.classList.add('modal', 'modal-blur');
        deleteModelDiv.setAttribute('id', `delete-recording-model-${recording.id}`);
        deleteModelDiv.innerHTML = `
              <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Opname Verwijderen</h5>
                  </div>
                  <div class="modal-body">
                    <h2>Weet u zeker dat je ${recording.name} wilt verwijderen?</h2>
                    <p>Deze actie is niet meer terug te draaien!</p>
                  </div>
                  <div class="modal-footer">
                    <div class="btn btn-primary" data-bs-dismiss="modal">
                      Annuleren
                    </div>
                    <div
                        class="btn btn-danger ms-auto d-flex gap-1" 
                        data-bs-dismiss="modal"
                        data-recording-id="${recording.id}"
                        data-delete-recording
                    >
                      <i class="fa-solid fa-trash"></i>
                      Verwijderen
                    </div>
                  </div>
                </div>
              </div>
            `;
        homeModelContainer.appendChild(deleteModelDiv);

        const deleteVideoModelButtons = document.querySelectorAll(`[data-delete-recording]`);
        deleteVideoModelButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const recordingId = button.getAttribute('data-recording-id');
                deleteRecording(recordingId);
            });
        });

    });
}

export const requestRecordings = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'recordings',
        action: 'list',
        data: {}
    }));
}

export const deleteRecording = (
    id
) => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'recordings',
        action: 'delete',
        data: {
            id
        }
    }));
}