import websocket from "websocket"
import gzip from "node-gzip";

export class UWebsocket {
    m_sWSUrl: string = "";
    OnReceive: ((sMsg: string) => void) | null = null;
    OnReceiveJson: ((jMsg: object) => void) | null = null;
    OnError: ((error: string) => void) | null = null;
    private m_bClosing: Boolean = false;
    private m_wsClient: websocket.client | null = null;
    private m_connection: websocket.connection | null = null;
    private m_QueueSMsg: string[] = [];
    private m_QueueJMsg: object[] = [];

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
            connection.on('message', async (message: websocket.Message) => {
                let sMsg: string;
                if (message.type === 'utf8') {
                    sMsg = message.utf8Data;
                }
                else {
                    sMsg = JSON.stringify(message.binaryData);
                    await gzip.ungzip(message.binaryData).then((myBuffer: Buffer) => {
                        let tmp: any[] = [];
                        myBuffer.forEach(b => {
                            tmp.push(String.fromCharCode(b));
                        });
                        sMsg = tmp.join('');
                    });
                }
                try {
                    this.OnReceive && this.OnReceive(sMsg);
                }
                catch {}
                try {
                    this.OnReceiveJson && this.OnReceiveJson(JSON.parse(sMsg));
                }
                catch {}
            });

            while (this.m_QueueSMsg.length > 0) {
                let sMsg: string | undefined = this.m_QueueSMsg.pop();
                if (sMsg !== undefined) this.Send(sMsg);
            }
            while (this.m_QueueJMsg.length > 0) {
                let jMsg: object | undefined = this.m_QueueJMsg.pop();
                if (jMsg !== undefined) this.SendJson(jMsg);
            }
        });

        this.m_wsClient.connect(this.m_sWSUrl);
    }

    Close(): void {

    }

    Send(sMsg: string): void {
        console.log("send", sMsg, this.m_connection && this.m_connection.connected);
        (this.m_connection && this.m_connection.connected) ? 
            this.m_connection.sendUTF(sMsg) : this.m_QueueSMsg.push(sMsg);
    }

    SendJson(jMsg: object): void {
        console.log("send", jMsg, this.m_connection && this.m_connection.connected);
        (this.m_connection && this.m_connection.connected) ? 
            this.m_connection.sendUTF(JSON.stringify(jMsg)) : this.m_QueueJMsg.push(jMsg);
    }
}
