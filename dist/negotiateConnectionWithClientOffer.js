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
/**
 * Performs the actual SDP exchange.
 *
 * 1. Constructs the client's SDP offer
 * 2. Sends the SDP offer to the server,
 * 3. Awaits the server's offer.
 *
 * SDP describes what kind of media we can send and how the server and client communicate.
 *
 * https://developer.mozilla.org/en-US/docs/Glossary/SDP
 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html#name-protocol-operation
 */
function negotiateConnectionWithClientOffer(peerConnection, endpoint, client, abortController) {
    return __awaiter(this, void 0, void 0, function* () {
        /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer */
        const offer = yield peerConnection.createOffer();
        /** https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription */
        yield peerConnection.setLocalDescription(offer);
        /** Wait for ICE gathering to complete */
        const ofr = yield waitToCompleteICEGathering(peerConnection);
        if (!ofr) {
            throw Error('failed to gather ICE candidates for offer');
        }
        /**
         * As long as the connection is open, attempt to...
         */
        while (peerConnection.connectionState !== 'closed') {
            /**
             * This response contains the server's SDP offer.
             * This specifies how the client should communicate,
             * and what kind of media client and server have negotiated to exchange.
             */
            const response = yield postSDPOffer(endpoint, ofr.sdp, abortController.signal);
            if (response.status === 201) {
                const answerSDP = yield response.text();
                yield peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSDP }));
                client.setIsConnected(true);
                return response.headers.get('Location');
            }
            else if (response.status === 405) {
                console.log('Remember to update the URL passed into the WHIP or WHEP client');
            }
            else {
                const errorMessage = yield response.text();
                console.error(errorMessage);
            }
            /** Limit reconnection attempts to at-most once every 5 seconds */
            yield new Promise((r) => setTimeout(r, 1000));
        }
    });
}
exports.default = negotiateConnectionWithClientOffer;
function postSDPOffer(endpoint, data, signal) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'content-type': 'application/sdp',
            },
            body: data,
            signal,
        });
    });
}
/**
 * Receives an RTCPeerConnection and waits until
 * the connection is initialized or a timeout passes.
 *
 * https://www.ietf.org/archive/id/draft-ietf-wish-whip-01.html#section-4.1
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/iceGatheringState
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/icegatheringstatechange_event
 */
function waitToCompleteICEGathering(peerConnection) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            /** Wait at most 1 second for ICE gathering. */
            setTimeout(function () {
                resolve(peerConnection.localDescription);
            }, 1000);
            peerConnection.onicegatheringstatechange = (ev) => peerConnection.iceGatheringState === 'complete' &&
                resolve(peerConnection.localDescription);
        });
    });
}
