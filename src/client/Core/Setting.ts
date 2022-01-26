import fs from 'fs';
import axios from 'axios'
import { TradeManager } from "./TradeManager";
import { UTimer, UWebsocket } from "../Utils";
import { LogicConfig, SiteConfig } from "../../common/config";
import { LogicManager } from '.';

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
  static g_wsClient: UWebsocket = new UWebsocket("ws://localhost:3002/up");
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
    this.g_wsClient.OnReceiveJson = this.onReceiveWS;
    this.g_wsClient.Open();

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
    return true;
  }

  static Deinit(): void {
  }

  static Report(sType: string, sKey: string, data: any): void {
    const report: any = {
      key: [this.g_sClientName, sType, sKey].join('$'),
      data: data
    };
    this.g_wsClient.Send(JSON.stringify({
      command: "report",
      report: report
    }));
  }

  private static reportSystem(): void {
    this.Report("system", "system", {
    });
  }

  private static onReceiveWS: ((jMsg: object) => void) = (jMsg: any) => {
    TradeManager.PutLog("onReceiveWS: " + JSON.stringify(jMsg));
    try {
      let cmd: string = jMsg["command"];
      if (cmd === "param") {
        let logic_key: string = jMsg["data"]["logic_key"];
        let params: any = jMsg["data"]["params"];
        let sClient: string = logic_key.split('$')[0];
        if (sClient != this.g_sClientName) return;
        let sLogic: string = logic_key.split('$')[2];
        let lstParamsparams: Array<Array<string>> = Object.keys(params).map(param => [param, params[param]]);
        LogicManager.SetParams(sLogic, lstParamsparams);
      }
      else if (cmd === "order") {
        let jData: any = jMsg["data"];
        let {logic_key, product, cmd, lots, price, type} = jData;
        let sClient: string = logic_key.split('$')[0];
        if (sClient != this.g_sClientName) return;
        let sLogic: string = logic_key.split('$')[2];
        console.log(jData);
        LogicManager.SetOrder(sLogic, product, cmd, lots, price, type);
      }
    }
    catch {}
  }
}
