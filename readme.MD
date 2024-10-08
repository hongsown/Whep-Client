# WHEP Client Library

## Overview

This library provides a simple implementation of a WHEP (WebRTC HTTP Egress Protocol) client for playback of video over WebRTC. It's designed to make it easy to integrate WebRTC-based video playback into your web applications.

## Features

- Easy-to-use WHEP client implementation
- Supports video and audio playback
- Automatic handling of WebRTC connection setup
- Configurable TURN server support
- Reconnection capability
- Automatic retry on connection errors
## Installation

```bash
npm install whep-client
```

## Usage

Here's a basic example of how to use the WHEPClient:

```typescript
import WHEPClient from 'whep-client';

const videoElement = document.getElementById('videoPlayer') as HTMLVideoElement;
const endpoint = 'https://your-whep-server-endpoint.com';
const turnServerConfig = {
  urls: 'turn:your-turn-server.com:3478',
  username: 'username',
  credential: 'password'
};

const client = new WHEPClient(endpoint, videoElement, turnServerConfig);

// Optional timeRequest parameter set to 5 seconds
const client = new WHEPClient(endpoint, videoElement, turnServerConfig, 5000);

// Set up the connection
client.setupConnection()
  .then(() => {
    console.log('WHEP client connected successfully');
  })
  .catch((error) => {
    console.error('Failed to connect WHEP client:', error);
  });

// To close the connection
// client.closeConnection();

// To reconnect
// client.reconnect();
```

## API Reference

### `WHEPClient`

#### Constructor

```typescript
constructor(endpoint: string, videoElement: HTMLVideoElement, turnServerConfig: TurnServerConfig, timeRequest?: number)
```

- `endpoint`: The WHEP server endpoint URL
- `videoElement`: The HTML video element to display the stream
- `turnServerConfig`: Configuration for the TURN server
- `timeRequest`(optional): The interval in seconds to retry the connection if an error occurs. Default is 3000ms (3 seconds).

#### Methods

| Method | Description |
|--------|-------------|
| `setupConnection(): Promise<void>` | Establishes the WebRTC connection |
| `closeConnection(): void` | Closes the WebRTC connection and cleans up resources |
| `reconnect(): Promise<void>` | Closes the current connection and establishes a new one |
| `getIsConnected(): boolean` | Returns the current connection status |
| `setIsConnected(isConnected: boolean): void` | Sets the connection status |
| `getTurnServerConfig(): TurnServerConfig` | Returns the current TURN server configuration |



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Specify your license here]

## Contact

[Your contact information or link to issues page]
