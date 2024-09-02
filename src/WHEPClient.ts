import { TurnServerConfig } from './interface.js';
import negotiateConnectionWithClientOffer from './negotiateConnectionWithClientOffer.js';

/**
 * Example implementation of a client that uses WHEP to playback video over WebRTC
 *
 * https://www.ietf.org/id/draft-murillo-whep-00.html
 */
export default class WHEPClient {
  private peerConnection: RTCPeerConnection;
  private stream: MediaStream;
  private isConnected = false;
  private abortController = new AbortController();
  private turnServerConfig: TurnServerConfig;
  private timeRequest?: number;
  constructor(
    private endpoint: string,
    private videoElement: HTMLVideoElement,
    turnServerConfig: TurnServerConfig,
    timeRequest: number = 3000,
  ) {
    this.stream = new MediaStream();
    this.turnServerConfig = turnServerConfig;
    this.timeRequest = timeRequest;

    /**
     * Create a new WebRTC connection, using public STUN servers with ICE,
     * allowing the client to disover its own IP address.
     * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Protocols#ice
     */
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        turnServerConfig
      ],
      iceTransportPolicy: 'relay',
      bundlePolicy: 'max-bundle',
    });


    /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTransceiver */
    this.peerConnection.addTransceiver('video', {
      direction: 'recvonly',
    });
    this.peerConnection.addTransceiver('audio', {
      direction: 'recvonly',
    });

    /**
     * When new tracks are received in the connection, store local references,
     * so that they can be added to a MediaStream, and to the <video> element.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
     */
    this.peerConnection.ontrack = (event) => {
      const track = event.track;
      const currentTracks = this.stream.getTracks();
      const streamAlreadyHasVideoTrack = currentTracks.some(
        (track) => track.kind === 'video',
      );
      const streamAlreadyHasAudioTrack = currentTracks.some(
        (track) => track.kind === 'audio',
      );
      switch (track.kind) {
        case 'video':
          if (streamAlreadyHasVideoTrack) {
            break;
          }
          this.stream.addTrack(track);
          break;
        case 'audio':
          if (streamAlreadyHasAudioTrack) {
            break;
          }
          this.stream.addTrack(track);
          break;
        default:
          console.log('got unknown track ' + track);
      }
    };

    this.peerConnection.addEventListener('connectionstatechange', (ev) => {
      if (this.peerConnection.connectionState !== 'connected') {
        return;
      }
      if (!this.videoElement.srcObject) {
        this.videoElement.srcObject = this.stream;
      }
    });

    this.peerConnection.addEventListener('negotiationneeded', (ev) => {
      negotiateConnectionWithClientOffer(
        this.peerConnection,
        this.endpoint,
        this,
        this.abortController,
        this.timeRequest
      );
    });
  }

  async setupConnection() {
    if (this.isConnected) {
      console.log('Connected.');
      return;
    }
    await negotiateConnectionWithClientOffer(
      this.peerConnection,
      this.endpoint,
      this,
      this.abortController,
      this.timeRequest,
    );
    this.isConnected = true;
    console.log('Connected.');
  }

  public closeConnection() {
    this.abortController.abort();
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.stream.getTracks().forEach((track) => track.stop());
  }

  async reconnect() {
    console.log('Connecting...');
    this.closeConnection();
    await this.setupConnection();
    console.log('Connected.');
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public setIsConnected(isConnected: boolean) {
    this.isConnected = isConnected;
  }

  public getTurnServerConfig(): TurnServerConfig {
    return this.turnServerConfig;
  }
}
