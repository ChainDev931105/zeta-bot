import { Connection, PublicKey } from '@solana/web3.js';
import { Market, MARKETS } from '@project-serum/serum';
import { Site } from './Site'
import { UWebsocket } from '../Utils';

const WS_URL_REAL: string = "wss://api.serum-vial.dev/v1/ws";
const WS_URL_DEMO: string = "wss://api.serum-vial.dev/v1/ws";

const URL_CONNECTION_REAL: string = "https://solana-api.projectserum.com";
const URL_CONNECTION_DEMO: string = "";

const PROGRAM_ADDRESS_REAL: string = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const PROGRAM_ADDRESS_DEMO: string = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";

export class SerumSite extends Site {
    m_websocket: UWebsocket | undefined;
    m_markets: Map<string, Market> = new Map<string, Market>();

    constructor() {
        super();
    }

    override R_Init(): Boolean {
        this.m_websocket = new UWebsocket(
            this.isReal() ? WS_URL_REAL : WS_URL_DEMO,
            null,
            this.onWSReceive,
            this.onWSError
        );
        
        return super.R_Init();
    }

    override R_Login(): Boolean {
        if (this.m_websocket && this.m_siteConfig.symbols.length > 0) {
            this.m_websocket.Open();
            this.m_websocket.SendJson({
                op: 'subscribe',
                channel: 'level1', // "level3" | "level2" | "level1" | "trades"
                markets: this.m_siteConfig.symbols.map(symbol => symbol[0])
            });
        }

        let connection = new Connection(this.isReal() ? URL_CONNECTION_REAL : URL_CONNECTION_DEMO);
        let programId = new PublicKey(this.isReal() ? PROGRAM_ADDRESS_REAL : PROGRAM_ADDRESS_DEMO);
        let bRlt = true;
        this.m_symbols.forEach(symbol => {
            let marketInfo = MARKETS.find(market => (
                market.name === symbol.m_sSymbolName && market.programId.toBase58() === programId.toBase58()
            ));
            if (marketInfo === undefined) {
                bRlt = false;
                return;
            }
            Market.load(connection, marketInfo.address, {}, programId).then(market => {
                this.m_markets.set(symbol.m_sSymbolName, market);
                console.log(symbol.m_sSymbolName, market);
            });
        });

        if (!bRlt) return false;

        return super.R_Login();
    }

    private isReal() {
        return this.m_siteConfig.property.toLowerCase().includes("real");
    }

    onWSReceive: ((jMsg: any) => void) = (jMsg: any) => {
        try {
            if (jMsg["type"] === "quote") {
                let sSymbol: string = jMsg["market"];
                let dAsk: number = parseFloat(jMsg["bestAsk"][0]);
                let dBid: number = parseFloat(jMsg["bestBid"][0]);
                let dAskSize: number = parseFloat(jMsg["bestAsk"][1]);
                let dBidSize: number = parseFloat(jMsg["bestBid"][1]);
                super.OnRateUpdate(sSymbol, dAsk, dBid, dAskSize, dBidSize);
            }
        }
        catch {}
    }

    onWSError: ((sError: string) => void) = (sError: string) => {
        super.PutSiteLog("Huobi error : " + sError);
    }
}
