import { AccountManager } from "./AccontManager";
import { LogicManager } from "./LogicManager";
import { OrderManager } from "./OrderManager";
import { ServerCon } from "./ServerCon";
import { Setting } from "./Setting";

export class TradeManager {
    static g_bRunning = true;

    constructor() {
    }

    static InitLog(onLog) {// 'onLog' is callback function
    }

    static MainProcess() {
        try
        {
            Setting.ReadGlobalConfig();
            this.PutLog("---------------------------------------------------------------------");
            this.PutLog("---------------------------", Setting.g_sClientName, "---------------------------");
            this.PutLog("---------------------------------------------------------------------");

            ServerCon.Connect();
            this.PutLog("step 0 - ServerCon.Connect() Success");
            
            // - Send Init Request to Server
            // - Wait for LogicConfig and SiteConfig to be set
            if (!Setting.Prepare()) return;
            this.PutLog("step 1 - Setting.Prepare() Success");

            // - Create Sites from SiteConfigs
            // - Init sites
            // - Login sites
            // - Wait for rates to be valid
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

            this.g_bRunning = true;
            let nCounter = 0;
            let nFailedCounter = 0;
            while (this.g_bRunning) {
                let bCheck = true;
                if (bCheck) bCheck &= Setting.OnTick(); // Check Server Command, SystemReport
                if (bCheck) bCheck &= AccountManager.OnTick(); // AccountReport, SymbolReport
                if (bCheck) bCheck &= OrderManager.OnTick(); // Check Position Match, 
                if (bCheck) bCheck &= LogicManager.OnTick(); // LogicReport, Run Logics

                if (!bCheck) {
                    nFailedCounter++;
                }
                nCounter++;
                if (nCounter >= Setting.g_nSleepCount) {
                    nCounter = 0;
                }
            }
            this.deinit();
        }
        catch (e) {
            this.PutLog("Exception in MainProcess: ", e.message);
            this.g_bRunning = false;
            this.deinit();
        }
    }

    static SetStop() {
        this.g_bRunning = false;
    }

    static deinit() {
        LogicManager.Deinit();
        OrderManager.Deinit();
        AccountManager.Deinit();
        Setting.Deinit();
        ServerCon.Disconnect();
    }

    static PutLog(sLog, bSendToServer = true) {
    }
}
