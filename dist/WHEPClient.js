"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const negotiateConnectionWithClientOffer_js_1 = require("./negotiateConnectionWithClientOffer.js");
/**
 * Example implementation of a client that uses WHEP to playback video over WebRTC
 *
 * https://www.ietf.org/id/draft-murillo-whep-00.html
 */
class WHEPClient {
    constructor(endpoint, videoElement, turnServerConfig) {
        this.endpoint = endpoint;
        this.videoElement = videoElement;
        this.isConnected = false;
        this.abortController = new AbortController();
        this.stream = new MediaStream();
        this.turnServerConfig = turnServerConfig;
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
            const streamAlreadyHasVideoTrack = currentTracks.some((track) => track.kind === 'video');
            const streamAlreadyHasAudioTrack = currentTracks.some((track) => track.kind === 'audio');
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
            (0, negotiateConnectionWithClientOffer_js_1.default)(this.peerConnection, this.endpoint, this, this.abortController);
        });
    }
    setupConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnected) {
                console.log('Connected.');
                return;
            }
            yield (0, negotiateConnectionWithClientOffer_js_1.default)(this.peerConnection, this.endpoint, this, this.abortController);
            this.isConnected = true;
            console.log('Connected.');
        });
    }
    closeConnection() {
        this.abortController.abort();
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.stream.getTracks().forEach((track) => track.stop());
    }
    reconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Đang kết nối lại...');
            this.closeConnection();
            yield this.setupConnection();
            console.log('Đã kết nối lại thành công.');
        });
    }
    getIsConnected() {
        return this.isConnected;
    }
    setIsConnected(isConnected) {
        this.isConnected = isConnected;
    }
    getTurnServerConfig() {
        return this.turnServerConfig;
    }
}
exports.default = WHEPClient;
