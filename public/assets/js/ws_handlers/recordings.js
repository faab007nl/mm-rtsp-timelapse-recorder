export const handleRecordingsAction = (action, data) => {
    switch (action) {
        case 'init':
            alertify.notify('Connection Ready', 'success', 2);
            break;
        case "recordings":
            updateRecordings(data);
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

        let video_status = 'Onbekend';
        let badge_color = 'bg-blue';
        if(recording.video_status === 0) {
            video_status = 'Geen Video';
            badge_color = 'bg-red';
        }
        if(recording.video_status === 1) {
            video_status = 'Genereren';
            badge_color = 'bg-orange';
        }
        if(recording.video_status === 2) {
            video_status = 'Gereed';
            badge_color = 'bg-green';
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
                    <span class="badge bg-blue data-tooltip">
                        <span class="data-tooltip-text" data-top>Opname Duur</span>
                        ${moment.utc(recording.duration * 1000).format('HH:mm:ss')}
                    </span>
                    <span 
                        class="badge ${badge_color} data-tooltip">
                        <span class="data-tooltip-text" data-top>Video Status</span>
                        ${video_status.toUpperCase()}
                    </span>
                </div>
                <div class="text-muted">${moment(recording.datetime).format('DD-MM-YYYY h:mm:ss')} (started ${moment(recording.datetime).fromNow()})</div>
            </div>
            <div class="col-auto d-flex gap-3 fs-1">
                <div data-bs-toggle="modal" data-bs-target="#generate-video-model-${recording.id}">
                    <div class="video-btn">
                        <i class="fa-solid fa-file-video"></i>
                    </div>
                </div>
                <a href="#" data-bs-toggle="modal" data-bs-target="#view-camera-video-model">
                    <div class="video-btn">
                        <i class="fa-solid fa-eye"></i>
                    </div>
                </a>
                <div class="video-btn">
                    <i class="fa-solid fa-download"></i>
                </div>
            </div>
        `;
        recordingsContainer.append(row);

        const existingModal = document.querySelector(`#generate-video-model-${recording.id}`);
        if(existingModal !== undefined && existingModal !== null) return;

        const generateVideoModel = document.createElement('div');
        generateVideoModel.classList.add('modal', 'modal-blur');
        generateVideoModel.id = `generate-video-model-${recording.id}`;
        generateVideoModel.tabIndex = '-1';

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
                      <div class="progress-bar" data-progress-bar-${recording.id} style="width: 0%" role="progressbar">
                      </div>
                    </div>
                    <span class="w-4">0%</span>
                </div>
                <div class="w-full d-flex justify-content-end">
                  <div class="btn btn-primary" onclick="window.startVideoGeneration(${recording.id}, '${recording.uid}')">
                    Genereer Videos
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        homeModelContainer.append(generateVideoModel);
    });
}

export const requestRecordings = () => {
    if(window.ws === undefined) return;
    window.ws.send(JSON.stringify({
        from: window.client_id,
        category: 'home',
        action: 'recordings',
        data: {}
    }));
}