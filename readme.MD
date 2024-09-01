# WHEP Client

WHEP Client is a library for playing back video over WebRTC using the WHEP protocol. This library handles the SDP exchange and ICE gathering process to establish a WebRTC connection.

## Installation

You can install the library using npm:

```sh
npm install whep-client

Usage
Here is an example of how to use the WHEPClient class to establish a WebRTC connection:
import WHEPClient from 'whep-client';

async function startPlayback() {
  const peerConnection = new RTCPeerConnection();
  const endpoint = 'https://your-server-endpoint.com';
  const turnServerConfig = {
    urls: 'turn:your-turn-server.com',
    username: 'your-username',
    credential: 'your-credential',
  };

  const client = new WHEPClient(peerConnection, turnServerConfig);

  try {
    await client.negotiateConnectionWithClientOffer(endpoint);
    console.log('Connection established');
  } catch (error) {
    console.error('Failed to establish connection', error);
  }
}

startPlayback();

API
WHEPClient
Constructor
new WHEPClient(peerConnection: RTCPeerConnection, turnServerConfig: TurnServerConfig)

peerConnection: An instance of RTCPeerConnection.
turnServerConfig: An object containing TURN server configuration.

Methods
negotiateConnectionWithClientOffer(endpoint: string): Promise<void>
Performs the SDP exchange to establish a WebRTC connection.

endpoint: The server endpoint to send the SDP offer to.
Development
To build the project, run:
npm run build

License
This project is licensed under the ISC License.

```