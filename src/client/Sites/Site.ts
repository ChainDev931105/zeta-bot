import { SiteConfig } from "../../common/config";
import { Symbol } from "../Global";

export class Site {
    m_siteConfig: SiteConfig = new SiteConfig();
    m_symbols: Map<string, Symbol> = new Map<string, Symbol>();

    constructor() {

    }

    R_Init(): Boolean {
        /*this.m_symbols.clear();
        this.m_siteConfig.symbols.
        foreach (var symbol in m_siteConfig.symbols)
        {
            m_symbols.Add(symbol[0], new Symbol()
            {
                m_site = this,
                m_sSymbolName = symbol[0]
            });
        }*/
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

    /*public virtual List<OHLC> R_GetPastRate(DateTime dtStart, DateTime dtEnd, int nUnitInMinutes) {
        return new List<OHLC>();
    }

    protected void PutSiteLog(string sLog) {
        TradeManager.PutLog(string.Format("<{0}> {1}", m_siteConfig.account_id, sLog));
    }*/

    static CreateSite(siteConfig: SiteConfig): Site {
        // TODO
        return new Site();
    }

    /*protected void OnRateUpdate(string sSymbol, double dAsk, double dBid, 
        double dAskVolume = 1, double dBidVolume = 1) {
        if (m_symbols.ContainsKey(sSymbol))
        {
            m_symbols[sSymbol].SetRate(dAsk, dBid, dAskVolume, dBidVolume);
        }
    }*/
}
