import { SiteConfig } from "../../common/config";
import { Symbol, ROrder } from "../Global";

export class Site {
    m_siteConfig: SiteConfig = new SiteConfig();
    m_symbols: Map<string, Symbol> = new Map<string, Symbol>();

    constructor() {

    }

    R_Init(): Boolean {
        this.m_symbols.clear();
        this.m_siteConfig.symbols.forEach(symbol => {
            let sym: Symbol = new Symbol();
            sym.m_site = this;
            sym.m_sSymbolName = symbol[0];
            this.m_symbols.set(symbol[0], sym);
        });
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

    R_OrderSend(rOrder: ROrder): Boolean {
        return false;
    }

    /*public virtual List<OHLC> R_GetPastRate(DateTime dtStart, DateTime dtEnd, int nUnitInMinutes) {
        return new List<OHLC>();
    }

    protected void PutSiteLog(string sLog) {
        TradeManager.PutLog(string.Format("<{0}> {1}", m_siteConfig.account_id, sLog));
    }*/

    /*protected void OnRateUpdate(string sSymbol, double dAsk, double dBid, 
        double dAskVolume = 1, double dBidVolume = 1) {
        if (m_symbols.ContainsKey(sSymbol)) {
            m_symbols[sSymbol].SetRate(dAsk, dBid, dAskVolume, dBidVolume);
        }
    }*/
}
