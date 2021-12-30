import fs from 'fs';
import axios from 'axios'
import { TradeManager } from "./TradeManager";
import { UTimer } from "../Utils";
import { LogicConfig, SiteConfig } from "../../common/config";

export class Setting {
    static GLOBAL_CONFIG_PATH: string = "./Config/global.json";

    static g_sClientName: string = "";
    static g_sServerHost: string = "";
    static g_sServerUser: string = "";
    static g_sServerPwd: string = "";
    static g_nSleepCount: number = 0;
    static g_nSleepPeriod: number = 0;
    static g_lstLogicConfig: Array<LogicConfig> = [];
    static g_lstSiteConfig: Array<SiteConfig> = [];
    static g_timerSystemReport: UTimer;
    static g_bInited: Boolean = false;
    
    static ReadGlobalConfig() {
        let data: string = fs.readFileSync(this.GLOBAL_CONFIG_PATH).toString();
        let jConfig: any = JSON.parse(data);
        this.g_sClientName = jConfig["client_name"];
        let jServerConfig: any = jConfig["server"];
        this.g_sServerHost = jServerConfig["host"];
        this.g_sServerUser = jServerConfig["user"];
        this.g_sServerPwd = jServerConfig["pwd"];
        try {
            let jSleepConfig: any = jConfig["sleep"];
            this.g_nSleepCount = parseInt(jSleepConfig["count"]);
            this.g_nSleepPeriod = parseInt(jSleepConfig["period"]);
        }
        catch { }
    }
    
    static async Prepare() {
        this.g_lstLogicConfig = [];
        this.g_lstSiteConfig = [];
        await axios.get(this.g_sServerHost + "/config?client=" + this.g_sClientName).then(function (resp) {
            let sites = resp.data.data["sites"];
            let logics = resp.data.data["logics"];
            TradeManager.PutLog("sites = " + JSON.stringify(sites));
            TradeManager.PutLog("logics = " + JSON.stringify(logics));
            Setting.g_lstSiteConfig = sites;
            TradeManager.PutLog("g_lstSiteConfig set success");
            Setting.g_lstLogicConfig = logics;
            TradeManager.PutLog("g_lstLogicConfig set success");
            Setting.g_bInited = true;
        }).catch(function (error) {
            TradeManager.PutLog("error " + error);
        });
        this.g_timerSystemReport = new UTimer(3000);
    }

    static OnTick(): Boolean {
        if (this.g_timerSystemReport.Check()) this.reportSystem();
        return false;
    }

    static Deinit(): void {
    }

    static reportSystem(): void {
        // TODO: 
    }
}
