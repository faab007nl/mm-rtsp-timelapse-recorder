# RTSP Timelapse Recorder

This is a simple script to record a timelapse from an RTSP stream. It uses ffmpeg to record the stream and then uses ffmpeg again to convert the video to a timelapse.

## Requirements
- Docker
- ffmpeg

## Usage
1. Download the dockerimage from dockerhub:  
   `docker pull faab007nl/rtsp-timelapse-recorder`
2. Run the docker image: 
   `docker run -d -v /<data_folder>:/app/data -p 3378:3378 --name rtsp-timelapse-recorder faab007nl/mm-rtsp-timelapse-recorder@latest`
3. Open the browser and go to:  
   `http://<ip>:3378`
4. Fill in the form and click on "Start recording"
5. Wait for the timelapse to be created
6. Download the timelapse