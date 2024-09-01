import WHEPClient from './WHEPClient';
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
export default function negotiateConnectionWithClientOffer(peerConnection: RTCPeerConnection, endpoint: string, client: WHEPClient, abortController: AbortController): Promise<string>;
