import websocket from "websocket"

export class UWebsocket {
    m_sWSUrl: string = "";
    OnReceive: ((sMsg: string) => void) | null = null;
    OnReceiveJson: ((jMsg: object) => void) | null = null;
    OnError: ((error: string) => void) | null = null;
    private m_bClosing: Boolean = false;
    private m_wsClient: websocket.client | null = null;
    private m_connection: websocket.connection | null = null;

    constructor(
        sWSUrl: string, 
        onReceive: ((sMsg: string) => void) | null = null, 
        onReceiveJson: ((jMsg: object) => void) | null = null,
        onError: ((error: string) => void) | null = null
    ) {
        this.m_sWSUrl = sWSUrl;
        this.OnReceive = onReceive;
        this.OnReceiveJson = onReceiveJson;
        this.OnError = onError;
    }

    Open(): void {
        this.m_wsClient = new websocket.client();
        this.m_wsClient.on('connect', (connection: websocket.connection) => {
            console.log('WebSocket client connected');
            this.m_connection = connection;
            connection.on('error', (error: Error) => {
                this.OnError && this.OnError(error.toString());
            });
            connection.on('close', () => {
                this.OnError && this.OnError('Connection Closed');
            });
            connection.on('message', (message: websocket.Message) => {
                if (message.type === 'utf8') {
                    try {
                        this.OnReceive && this.OnReceive(message.utf8Data);
                    }
                    catch {}
                    try {
                        this.OnReceiveJson && this.OnReceiveJson(JSON.parse(message.utf8Data));
                    }
                    catch {}
                }
            });
        });

        //this.m_wsClient.on('connect', this.OnConnection);
        this.m_wsClient.connect(this.m_sWSUrl);
    }

    Close(): void {

    }

    Send(sMsg: string): void {
        this.m_connection && this.m_connection.sendUTF(sMsg);
    }

    SendJson(jMsg: object): void {
        this.m_connection && this.m_connection.sendUTF(JSON.stringify(jMsg));
    }
}
