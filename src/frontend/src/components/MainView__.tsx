import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const MainView = () => {
  const [socketUrl, setSocketUrl] = useState<string>(process.env.BACKEND_WS ? process.env.BACKEND_WS : "ws://localhost:3002/down");
  const [messageHistory, setMessageHistory] = useState([]);
  const [reports, setReports] = useState<any>({});

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage) {
      let dt: any = JSON.parse(lastMessage.data);
      if (dt["command"] === "report") {
        let key: string = dt["report"]["key"];
        let value: string = dt["report"];
        reports[key] = value;
        console.log(reports);
        setReports(reports);
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickSendMessage = useCallback(() =>
    sendMessage('{"command": "reset"}'), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'Hello'
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <div>
        {Object.keys(reports).map((report, id) => <div key={id}>
          {JSON.stringify(reports[report])}
          </div>)}
      </div>
    </div>
  );
};