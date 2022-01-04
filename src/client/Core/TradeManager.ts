import { AccountManager } from "./AccountManager";
import { LogicManager } from "./LogicManager";
import { OrderManager } from "./OrderManager";
import { Setting } from "./Setting";
import { DateToStr, UFile } from "../Utils";
import { HISTORY_DIR, MAIN_LOG_DIR } from "../Global/Constants";

export class TradeManager {
    static g_bRunning: Boolean = true;
    static g_nCounter: number = 0;
    static g_nFailedCounter: number = 0;
    static OnLog: ((str:string) => void);
    static g_timerServerCon: NodeJS.Timer | null = null;
    static g_timerOnTick: NodeJS.Timer | null = null;
    static g_sLogFilePath: string = "";

    constructor() {
    }

    static InitLog(onLog: ((x:string) => void) = (() => {})): void {// 'onLog' is callback function
        this.OnLog = onLog;
        if (!UFile.DirExists(HISTORY_DIR)) UFile.CreateDir(HISTORY_DIR);
        if (!UFile.DirExists(MAIN_LOG_DIR)) UFile.CreateDir(MAIN_LOG_DIR);
        this.g_sLogFilePath = MAIN_LOG_DIR + DateToStr(new Date(), "yyyyMMddHH") + ".txt";

    }

    static async MainProcess() {
        try {
            Setting.ReadGlobalConfig();
            this.PutLog("---------------------------------------------------------------------");
            this.PutLog("---------------------------" + Setting.g_sClientName + "---------------------------");
            this.PutLog("---------------------------------------------------------------------");

            // - Send Init Request to Server
            // - Wait for LogicConfig and SiteConfig to be set
            await Setting.Prepare();
            this.PutLog("step 1 - Setting.Prepare() Success");

            // - Create Sites from SiteConfigs
            // - Init sites
            // - Login sites
            if (!AccountManager.Prepare()) return;
            this.PutLog("step 2 - AccountManager.Prepare() Success");

            // - Create Logics from LogicConfigs
            // - Init logics
            if (!LogicManager.Prepare()) return;
            this.PutLog("step 3 - LogicManager.Prepare() Success");

            // - Read VPosition
            // - Compare VPosition vs ROrder
            if (!OrderManager.Prepare()) return;
            this.PutLog("step 4 - OrderManager.Prepare() Success");

            this.g_timerServerCon = setInterval(() => {}, 1000);
            this.g_timerOnTick = setInterval(this.OnTick, 2000);

            this.g_bRunning = true;
            this.deinit();
        }
        catch (e: any) {
            this.PutLog("Exception in MainProcess: " + e.message);
            this.g_bRunning = false;
            this.deinit();
        }
    }

    static OnTick(): Boolean {
        let bCheck: Boolean = this.g_bRunning;
        if (bCheck) bCheck &&= Setting.OnTick(); // Check Server Command, SystemReport
        if (bCheck) bCheck &&= AccountManager.OnTick(); // AccountReport, SymbolReport
        if (bCheck) bCheck &&= OrderManager.OnTick(); // Check Position Match, 
        if (bCheck) bCheck &&= LogicManager.OnTick(); // LogicReport, Run Logics
        console.log("OnTick");

        if (!bCheck) {
            this.g_nFailedCounter++;
        }
        this.g_nCounter++;
        if (this.g_nCounter >= Setting.g_nSleepCount) {
            this.g_nCounter = 0;
        }
        return bCheck;
    }

    static SetStop(): void {
        this.g_bRunning = false;
        if (this.g_timerOnTick !== null) clearInterval(this.g_timerOnTick);
    }

    static deinit(): void {
        LogicManager.Deinit();
        OrderManager.Deinit();
        AccountManager.Deinit();
        Setting.Deinit();
        if (this.g_timerServerCon !== null) clearInterval(this.g_timerServerCon);
    }

    static PutLog(sLog: string, bSendToServer: Boolean = true): void {
        console.log(sLog);
        sLog = DateToStr(new Date(), "[yyyy-MM-dd HH:mm:ss.fff] ") + sLog;
        UFile.AppendLine(this.g_sLogFilePath, sLog);
    }
}
