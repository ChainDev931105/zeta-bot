import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocketDemo = () => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState("ws://localhost:3002/down");
  const [messageHistory, setMessageHistory] = useState([]);
  const [reports, setReports] = useState<any>({});

  const {
    sendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(socketUrl);

  useEffect(() => {
    // if (lastMessage !== null) {
    //   setMessageHistory(prev => prev.concat(lastMessage));
    // }
    console.log("lastMessage", lastMessage?.data);
    if (lastMessage) {
      let dt: any = JSON.parse(lastMessage.data);
      if (dt["command"] === "report") {
        console.log("I love KGS");
        let key: string = dt["report"]["key"];
        let value: string = dt["report"];
        let newReports = { ...reports };
        newReports[key] = value;
        setReports(newReports);
      }
    }
  }, [lastMessage, setMessageHistory]);

  const handleClickChangeSocketUrl = useCallback(() =>
    setSocketUrl("ws://localhost:3002/down"), []);

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
        onClick={handleClickChangeSocketUrl}
      >
        Click Me to change Socket Url
      </button>
      <button
        onClick={handleClickSendMessage}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'Hello'
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory
          .map((message: any, idx) => <span key={idx}>{message ? message.data : null}</span>)}
      </ul>
      <div>
        {Object.keys(reports).map((report, id) => <div>
          {JSON.stringify(reports[report])}
          </div>)}
      </div>
    </div>
  );
};