/* eslint-disable @typescript-eslint/no-explicit-any */
let wxp: any;
let targetOrigin = '';
let webSocketToken: string;
let webSocketTokenEvent: Event;

export default class ZoomManager {
  private static instance: ZoomManager;

  initialize(webXPanelParam: any) {
    wxp = webXPanelParam;

    this.finishInitialization();

    return new Promise((resolve) => {
      // async/await for event before returning
      waitForWebSocketToken().then(() => {
        resolve('success');
      });
    });
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
  const data = JSON.parse(event.data);

  // Do not check if message is 'ch5-zoom-lib-ready-ack'. The message response contains 'targetOrigin'
  if (data.message !== 'ch5-zoom-lib-ready-ack') {
    if (targetOrigin !== event.origin) {
      return;
    }
  }

  switch (data.message) {
    case 'ch5-zoom-lib-ready-ack': {
      console.log("[CZL] received 'ch5-zoom-lib-ready-ack'");
      const message = JSON.stringify({
        message: 'get-websockettoken',
      });
      const url = new URL(data.data);
      targetOrigin = url.protocol + '//' + url.hostname;
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

function waitForWebSocketToken() {
  return new Promise((resolve) => {
    let timer: number | undefined;

    function customWebSocketTokenEventHandler() {
      clearTimeout(timer);
      wxp.default.websocketToken = webSocketToken;
      window.removeEventListener(
        'webSocketTokenEvent',
        customWebSocketTokenEventHandler
      );
      resolve("[CZL] set 'wxp.default.websocketToken'");
    }

    webSocketTokenEvent = new CustomEvent('webSocketTokenEvent');
    window.addEventListener(
      'webSocketTokenEvent',
      customWebSocketTokenEventHandler
    );
  });
}
