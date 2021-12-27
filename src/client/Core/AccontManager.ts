import { UTimer } from "../Utils";
import { Site } from "../Sites/Site";
import { Symbol } from "../Global/Symbol";

export class AccountManager {
    static g_accounts: { [key: string]: Site } = {};
    static g_lstSymbol: Array<Symbol>  = [];
    static g_timerAccountReport: UTimer;
    static g_timerSymbolReport: UTimer;
    static g_nLastReportedAccount: number = 0;
    static g_nLastReportedSymbol: number = 0;

    constructor() {

    }

    static Prepare(): Boolean {
        for (var key in this.g_accounts) delete this.g_accounts[key];

        return false;
    }

    static OnTick(): Boolean {
        return false;
    }

    static Deinit(): void {
    }
}
