import { SiteConfig } from "../../common/config";
import { OrderManager, TradeManager } from "../Core";
import { Symbol, ROrder, ORDER_COMMAND, EP } from "../Global";
import { AccountInfo } from "../Global/Global";

export type PartOrder = {
    dOrderTotPrice: number,
    dOrderLots: number,
    dSignalLots: number,
    sMagicNumber: string,
    eCmd: ORDER_COMMAND
}

export class Site {
    m_siteConfig: SiteConfig = new SiteConfig();
    m_symbols: Map<string, Symbol> = new Map<string, Symbol>();
    m_accountInfo: AccountInfo = new AccountInfo();
    protected m_partOrders: Map<string, PartOrder> = new Map<string, PartOrder>();

    constructor() {

    }

    R_Init(): Boolean {
        this.m_symbols.clear();
        this.m_siteConfig.symbols.forEach(symbol => {
            let sym: Symbol = new Symbol(this, symbol[0]);
            this.m_symbols.set(symbol[0], sym);
        });
        this.m_partOrders.clear();
        return true;
    }

    R_Login(): Boolean {
        return true;
    }

    R_Logout(): void {
    }

    R_OnTick(): Boolean {
        return true;
    }

    R_UpdatePosInfo(): void {
    }

    R_OrderSend(rOrder: ROrder): Boolean { // parent function should be called before child function
        if (this.m_partOrders.has(rOrder.m_symbol.m_sSymbolName)) {
            this.PutSiteLog("Prev Order is not excuted yet.");
            return false;
        }
        this.m_partOrders.set(rOrder.m_symbol.m_sSymbolName, {
            dOrderTotPrice: 0,
            dOrderLots: 0,
            dSignalLots: rOrder.m_dSigLots,
            sMagicNumber: rOrder.m_sMagicNumber,
            eCmd: rOrder.m_eCmd
        });
        return true;
    }

    /*public virtual List<OHLC> R_GetPastRate(DateTime dtStart, DateTime dtEnd, int nUnitInMinutes) {
        return new List<OHLC>();
    }

    protected void PutSiteLog(string sLog) {
        TradeManager.PutLog(string.Format("<{0}> {1}", m_siteConfig.account_id, sLog));
    }*/

    OnRateUpdate(sSymbol: string, dAsk: number, dBid: number, dAskVolume: number = 1, dBidVolume: number = 1): void {
        this.m_symbols.get(sSymbol)?.SetRate(dAsk, dBid, dAskVolume, dBidVolume);
    }

    protected OnOrderUpdate: ((sSymbol: string, dLots: number, dPrice: number) => void) = 
    (sSymbol: string, dLots: number, dPrice: number) => {
        this.PutSiteLog([
            "OnOrderUpdate",
            sSymbol,
            dLots,
            dPrice
        ].join(''));
        let partOrder: PartOrder | undefined = this.m_partOrders.get(sSymbol);
        if (partOrder !== undefined) {
            partOrder.dOrderLots += dLots;
            partOrder.dOrderTotPrice += dLots * dPrice;
            if (partOrder.dOrderLots > partOrder.dSignalLots + EP) {
                this.PutSiteLog("Overflow Order" + partOrder);
            }
            else if (partOrder.dOrderLots > partOrder.dSignalLots - EP) {
                OrderManager.OrderFinished(partOrder.sMagicNumber, partOrder.dOrderLots, partOrder.dOrderTotPrice);
                this.m_partOrders.delete(sSymbol);
            }
        }
        else {
            this.PutSiteLog("Unexpected m_PartOrder");
        }
    }

    protected OnOrderFinished: ((sSymbol: string) => void) = (sSymbol: string) => {
        let partOrder: PartOrder | undefined = this.m_partOrders.get(sSymbol);
        if (partOrder !== undefined) {
            OrderManager.OrderFinished(partOrder.sMagicNumber, partOrder.dOrderLots, partOrder.dOrderTotPrice);
            this.m_partOrders.delete(sSymbol);
        }
        else {
            this.PutSiteLog("Unexpected m_PartOrder");
        }        
    }

    protected PutSiteLog(sLog: string): void {
        TradeManager.PutLog("<" + (this.m_siteConfig ? this.m_siteConfig.account_id : "") + "> " + sLog);
    }
}
