/* eslint-disable @typescript-eslint/no-explicit-any */
// How long to wait for the host to supply the websocket token before giving up.
const WEBSOCKET_TOKEN_TIMEOUT_MS = 10000;

let targetOrigin = '';
let webSocketToken: string;
let webSocketTokenEvent: Event;

export default class ZoomManager {
  private static instance: ZoomManager;

  initialize(): Promise<string> {
    this.finishInitialization();

    // async/await for event before returning the token
    return waitForWebSocketToken();
  }

  finishInitialization() {
    window.addEventListener('message', handleMessages);
    this.postCh5ZoomLibReadyMessage();
  }

  postCh5ZoomLibReadyMessage() {
    const message = JSON.stringify({
      message: 'ch5-zoom-lib-ready',
    });
    window.parent.postMessage(message, '*');
    console.log("[CZL] posted message 'ch5-zoom-lib-ready'");
  }

  public static getInstance(): ZoomManager {
    if (ZoomManager.instance === undefined) {
      ZoomManager.instance = new ZoomManager();
    }
    return ZoomManager.instance;
  }
}

function handleMessages(this: any, event: any) {
  // Other frames and scripts post messages too; only JSON strings are part of this handshake.
  if (typeof event.data !== 'string') {
    return;
  }

  let data: any;
  try {
    data = JSON.parse(event.data);
  } catch {
    return;
  }

  if (!data || typeof data !== 'object') {
    return;
  }

  // Every handshake message comes from the host window; another frame on the same origin must not
  // be able to answer it (for example, to supply its own websocket token).
  if (event.source !== window.parent) {
    return;
  }

  if (data.message === 'ch5-zoom-lib-ready-ack') {
    // The acknowledgement supplies the origin every later message is checked against, so accept it
    // only once.
    if (targetOrigin) {
      return;
    }
  } else if (targetOrigin !== event.origin) {
    return;
  }

  switch (data.message) {
    case 'ch5-zoom-lib-ready-ack': {
      console.log("[CZL] received 'ch5-zoom-lib-ready-ack'");
      const message = JSON.stringify({
        message: 'get-websockettoken',
      });
      let origin: string;
      try {
        // URL.origin keeps a non-default port, which the replies' event.origin includes.
        origin = new URL(data.data).origin;
      } catch {
        console.log('[CZL] ignored ack with an invalid origin');
        return;
      }
      targetOrigin = origin;
      window.parent.postMessage(message, targetOrigin);
      console.log("[CZL] posted message 'get-websockettoken'");
      break;
    }

    case 'get-websockettoken-resp': {
      console.log("[CZL] received 'get-websockettoken-resp'");
      webSocketToken = data.webSocketToken;
      window.dispatchEvent(webSocketTokenEvent);
      break;
    }

    default:
      break;
  }
}

function waitForWebSocketToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    function customWebSocketTokenEventHandler() {
      window.clearTimeout(timer);
      window.removeEventListener(
        'webSocketTokenEvent',
        customWebSocketTokenEventHandler
      );
      resolve(webSocketToken);
    }

    // Without a bound, a host that never answers leaves the panel waiting forever.
    const timer = window.setTimeout(() => {
      window.removeEventListener(
        'webSocketTokenEvent',
        customWebSocketTokenEventHandler
      );
      reject(
        new Error(
          `No websocket token received within ${WEBSOCKET_TOKEN_TIMEOUT_MS} ms`
        )
      );
    }, WEBSOCKET_TOKEN_TIMEOUT_MS);

    webSocketTokenEvent = new CustomEvent('webSocketTokenEvent');
    window.addEventListener(
      'webSocketTokenEvent',
      customWebSocketTokenEventHandler
    );
  });
}
