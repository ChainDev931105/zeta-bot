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
    }
    
    static Prepare(): Boolean {
        return false;
    }

    static OnTick(): Boolean {
        return false;
    }

    static Deinit(): void {
    }
}
