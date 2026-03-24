'use strict';

// Stub for the 'ws' Node.js WebSocket library.
// engine.io-client's websocket.node.js transport requires 'ws', but in React Native
// the global WebSocket is used instead (via websocket.js). This stub prevents
// the Node.js ws module from being loaded and throwing stream-related errors.

class WebSocket {
  constructor() {
    throw new Error(
      '[ws-stub] Node.js ws library is not supported in React Native. ' +
      'engine.io-client should use the global WebSocket instead.'
    );
  }
}

module.exports = { WebSocket };
module.exports.WebSocket = WebSocket;
module.exports.default = { WebSocket };
