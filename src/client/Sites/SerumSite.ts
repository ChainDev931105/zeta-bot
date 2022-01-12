import { Account, Connection, PublicKey } from '@solana/web3.js';
import { Market, MARKETS } from '@project-serum/serum';
import { Site } from './Site'
import { UWebsocket } from '../Utils';
import { ORDER_COMMAND, ORDER_KIND, ROrder } from '../Global';

const WS_URL_REAL: string = "wss://api.serum-vial.dev/v1/ws";
const WS_URL_DEMO: string = "wss://api.serum-vial.dev/v1/ws";

const URL_CONNECTION_REAL: string = "https://solana-api.projectserum.com";
const URL_CONNECTION_DEMO: string = "";

const PROGRAM_ADDRESS_REAL: string = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const PROGRAM_ADDRESS_DEMO: string = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";

export class SerumSite extends Site {
    m_websocket: UWebsocket | undefined;
    m_markets: Map<string, Market> = new Map<string, Market>();
    m_connection: Connection = new Connection("");
    m_orderIDs: Map<string, Boolean> = new Map<string, Boolean>();

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

        this.m_connection = new Connection(this.isReal() ? URL_CONNECTION_REAL : URL_CONNECTION_DEMO);
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
            Market.load(this.m_connection, marketInfo.address, {}, programId).then(market => {
                this.m_markets.set(symbol.m_sSymbolName, market);
                console.log(symbol.m_sSymbolName, market);
            });
        });

        if (!bRlt) return false;

        return super.R_Login();
    }

    override R_Logout(): void {
        this.m_websocket?.Close();
        super.R_Logout();
    }

    override R_OnTick(): Boolean {
        return super.R_OnTick();
    }
    
    override R_UpdatePosInfo(): void {
        this.m_markets.forEach((market, sSymbol) => {
            market.loadFills(this.m_connection).then(fills => {
                fills.forEach(fill => {
                    if (this.m_orderIDs.has(fill.orderID)) {
                        super.OnOrderUpdate(sSymbol, fill.size, fill.price);
                        this.m_orderIDs.delete(fill.orderID);
                    }
                });
            });
        });
        super.R_UpdatePosInfo();
    }

    override R_OrderSend(rOrder: ROrder): Boolean {
        if (!super.R_OrderSend(rOrder)) return false;

        let market: Market | undefined = this.m_markets.get(rOrder.m_symbol.m_sSymbolName);
        if (market === undefined) return false;
        let owner: Account = new Account(); // TODO
        let payer: PublicKey = new PublicKey("");

        market.placeOrder(this.m_connection, {
            owner,
            payer,
            side: (rOrder.m_eCmd === ORDER_COMMAND.Buy || rOrder.m_eCmd === ORDER_COMMAND.SellClose) ? 'buy' : 'sell', // 'buy' or 'sell'
            price: rOrder.m_dSigPrice,
            size: rOrder.m_dSigLots,
            orderType: rOrder.m_eKind === ORDER_KIND.Limit ? 'limit' : 'ioc', // 'limit', 'ioc', 'postOnly'
        }).then(rlt => {
            this.PutSiteLog("Order Response: " + JSON.stringify(rlt));
        });
        return true;
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
