import { Site } from './Site'
import { Symbol, ROrder } from "../Global";
import { UWebsocket } from '../Utils';

const WS_BASE_URL: string = "wss://api.huobipro.com/ws";

export class HuobiSite extends Site {
    m_websocket: UWebsocket;

    constructor() {
        super();
        this.m_websocket = new UWebsocket(
            WS_BASE_URL,
            null, //onReceive
            this.onWSReceive, //onReceiveJson
            this.onWSError //onError
            );
    }

    R_Init(): Boolean {
        return super.R_Init();
    }

    R_Login(): Boolean {
        this.m_websocket.Open();
        this.m_symbols.forEach(symbol => {
            this.m_websocket.SendJson({
                "sub": "market." + symbol.m_sSymbolName + ".ticker"
            });
        });

        return super.R_Login();
    }

    R_Logout(): void {
        super.R_Logout();
    }

    R_OnTick(): Boolean {
        return super.R_OnTick();
    }

    R_UpdatePosInfo(): void {
        super.R_UpdatePosInfo();
    }

    R_OrderSend(rOrder: ROrder): Boolean {
        if (!super.R_OrderSend(rOrder)) return false;
        return true;
    }

    onWSReceive(jMsg: any): void {
        try {
            const ch: string = jMsg["ch"].toString();
            const chWords: string[] = ch.split('.');
            if (chWords.length === 3 && chWords[0] === "market" && chWords[2] === "ticker") {
                const sSymbol: string = chWords[1];
                const jTick: any = jMsg["tick"];
                if (jTick) {
                    const dAsk: number = jTick["ask"];
                    const dBid: number = jTick["bid"];
                    const dAskSize: number = jTick["askSize"];
                    const dBidSize: number = jTick["bidSize"];
                    super.OnRateUpdate(sSymbol, dAsk, dBid, dAskSize, dBidSize);
                }
            }
        }
        catch {}
    }

    onWSError(sError: string): void {
        super.PutSiteLog("Huobi error : " + sError);
    }
}
