import { TurnServerConfig } from './interface.js';
/**
 * Example implementation of a client that uses WHEP to playback video over WebRTC
 *
 * https://www.ietf.org/id/draft-murillo-whep-00.html
 */
export default class WHEPClient {
    private endpoint;
    private videoElement;
    private peerConnection;
    private stream;
    private isConnected;
    private abortController;
    private turnServerConfig;
    constructor(endpoint: string, videoElement: HTMLVideoElement, turnServerConfig: TurnServerConfig);
    setupConnection(): Promise<void>;
    closeConnection(): void;
    reconnect(): Promise<void>;
    getIsConnected(): boolean;
    setIsConnected(isConnected: boolean): void;
    getTurnServerConfig(): TurnServerConfig;
}
