import {VideoStream} from "../videoStream";

export interface CameraFeed {
    id: number;
    name: string;
    url: string;
    interval: number;
    wsPort: number;
    active?: boolean;
    disabled?: boolean;
}

export interface Setting {
    key: string;
    value: string;
}

export interface WsMessage {
    from: string;
    category: string;
    action: string;
    data: any;
}

export interface WsResponse extends WsMessage {
    to: string;
}

export interface ActiveCameraStream {
    id: number;
    wsPort: number;
    stream: VideoStream;
}

export interface ActiveCameraStreams {
    [key: number]: ActiveCameraStream;
}

export interface Recording {
    id: number;
    name: string;
    duration: number;
    datetime: number;
}