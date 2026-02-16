export interface BlobType {
    data: string;
    mimeType: string;
}

export enum ConnectionState {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    ERROR = 'error',
}

export interface VolumeData {
    input: number;
    output: number;
}
