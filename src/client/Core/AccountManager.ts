import { UTimer } from "../Utils";
import { Site, CreateSite } from "../Sites";
import { Symbol } from "../Global";
import { Setting, TradeManager } from ".";

export class AccountManager {
    static g_accounts: Map<string, Site> = new Map<string, Site>();
    static g_lstSymbol: Array<Symbol>  = [];
    static g_timerAccountReport: UTimer;
    static g_timerSymbolReport: UTimer;
    static g_nLastReportedAccount: number = 0;
    static g_nLastReportedSymbol: number = 0;

    constructor() {

    }

    static Prepare(): Boolean {
        this.g_accounts.clear();
        Setting.g_lstSiteConfig.forEach(siteConfig => {
            this.g_accounts.set(siteConfig.account_id, CreateSite(siteConfig));
        });
        let bRlt: Boolean = true;
        this.g_accounts.forEach(account => {
            if (bRlt && !account.R_Init()) {
                TradeManager.PutLog(account.m_siteConfig.account_id + " R_Init() Failed");
                bRlt = false;
            }
            if (bRlt && !account.R_Login()) {
                TradeManager.PutLog(account.m_siteConfig.account_id + " R_Login() Failed");
                bRlt = false;
            }
        });
        this.g_lstSymbol = [];
        this.g_accounts.forEach(account => {
            account.m_symbols.forEach(symbol => {
                this.g_lstSymbol.push(symbol);
            });
        });
        this.g_timerAccountReport = new UTimer(100);
        this.g_timerSymbolReport = new UTimer(100);

        // TODO: wait for rate to be valid
        return bRlt;
    }

    static OnTick(): Boolean {
        let bRlt: Boolean = true;
        this.g_accounts.forEach(site => {
            if (bRlt && !site.R_OnTick()) bRlt = false;
        });
        if (!bRlt) return false;

        if (this.g_timerAccountReport.Check()) this.reportAccounts();
        if (this.g_timerSymbolReport.Check()) this.reportSymbols();
        return false;
    }

    static Deinit(): void {
    }

    static reportAccounts(): void {
        if (this.g_nLastReportedAccount >= this.g_accounts.size) {
            if (this.g_accounts.size < 1) return;
            this.g_nLastReportedAccount %= this.g_accounts.size;
        }
        let account: Site | undefined = this.g_accounts.get(Array.from(this.g_accounts.keys())[this.g_nLastReportedAccount]);
        // TODO: reportAccount(account)

        this.g_nLastReportedAccount++;
    }

    static reportSymbols(): void {
        if (this.g_nLastReportedSymbol >= this.g_lstSymbol.length) {
            if (this.g_lstSymbol.length < 1) return;
            this.g_nLastReportedSymbol %= this.g_lstSymbol.length;
        }
        let symbol: Symbol = this.g_lstSymbol[this.g_nLastReportedSymbol];
        // TODO: reportSymbol(symbol)
    }
}
