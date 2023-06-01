export interface NewCamera {
    name: string;
    url: string;
    interval: number;
    activeFrom: number;
    activeTo: number;
}

export interface Camera extends NewCamera{
    id: number;
    currentRecordingId?: number;
}

export interface NewRecording {
    cameraId: number;
    name: string;
}

export interface Recording extends NewRecording {
    id: number;
    screenshotCount: number;
    started: number;
    ended?: number;
    videoGenerated: boolean;
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