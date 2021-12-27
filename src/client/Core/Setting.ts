import { ServerCon } from "./ServerCon";
import { TradeManager } from "./TradeManager";
import { UTimer } from "../Utils";
import { LogicConfig, SiteConfig } from "../../common/config";

export class Setting {
    static g_sClientName: string = "";
    static g_sRMQHost: string = "";
    static g_sRMQUser: string = "";
    static g_sRMQPwd: string = "";
    static g_nSleepCount: number = 0;
    static g_nSleepPeriod: number = 0;
    static g_lstLogicConfig: Array<LogicConfig> = [];
    static g_lstSiteConfig: Array<SiteConfig> = [];
    static g_timerSystemReport: UTimer;
    
    static ReadGlobalConfig() {
        let jConfig: any = {};// TODO: should read jConfig from file
        this.g_sClientName = jConfig["client_name"];
        let jRMQConfig: any = jConfig["server"];
        this.g_sRMQHost = jRMQConfig["host"];
        this.g_sRMQUser = jRMQConfig["user"];
        this.g_sRMQPwd = jRMQConfig["pwd"];
        try
        {
            let jSleepConfig: any = jConfig["sleep"];
            this.g_nSleepCount = parseInt(jSleepConfig["count"]);
            this.g_nSleepPeriod = parseInt(jSleepConfig["period"]);
        }
        catch { }
    }
    
    static Prepare(): Boolean {
        this.g_lstLogicConfig = [];
        this.g_lstSiteConfig = [];
        ServerCon.SendInit();
        let nFailed: number = 0;
        // TODO: wait for g_lstSiteConfig to be not null
        // while (true) {
        //     lock (g_oLock)
        //     {
        //         if (g_lstLogicConfig != null && g_lstSiteConfig != null)
        //             break;
        //     }
        //     Thread.Sleep(1000);
        //     if (++nFailed >= 20) return false;
        // }
        this.g_timerSystemReport = new UTimer(3000);
        return true;
    }

    static OnTick(): Boolean {
        if (this.g_timerSystemReport.Check()) this.reportSystem();
        return false;
    }

    static Deinit(): void {
    }

    static SetLogicConfig(jLogicConfig: any)
    {
        // TODO: parse jLogicConfig to g_lstLogicConfig

        // try
        // {
        //     List<LogicConfig> lstLogicConfig = JsonConvert.DeserializeObject<List<LogicConfig>>(sLogicConfig);
        //     lock (g_oLock)
        //     {
        //         g_lstLogicConfig = lstLogicConfig;
        //     }
        // }
        // catch (e) {
        //     TradeManager.PutLog("SetLogicConfig Failed : " + e.Message);
        // }
        TradeManager.PutLog("SetLogicConfig Success");
    }

    static SetSiteConfig(sSiteConfig: any)
    {
        // TODO: parse sSiteConfig to g_lstSiteConfig
        
        // try
        // {
        //     List<SiteConfig> lstSiteConfig = JsonConvert.DeserializeObject<List<SiteConfig>>(sSiteConfig);
        //     lock (g_oLock)
        //     {
        //         g_lstSiteConfig = lstSiteConfig;
        //     }
        // }
        // catch (e) {
        //     TradeManager.PutLog("SetSiteConfig Failed : " + e.Message);
        // }
        TradeManager.PutLog("SetSiteConfig Success");
    }

    static reportSystem(): void {
        // TODO: 
    }
}
