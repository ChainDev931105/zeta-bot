import { Logic, CreateLogic } from "../Logics";
import { UTimer } from "../Utils";
import { Setting, TradeManager } from "./";

export class LogicManager {
    static g_logics: Map<string, Logic> = new Map<string, Logic>();
    static g_timerLogicReport: UTimer;
    static g_nLastReportedLogic: number = 0;

    constructor() {

    }
    
    static Prepare(): Boolean {
        this.g_logics.clear();
        Setting.g_lstLogicConfig.forEach(logicConfig => {
            this.g_logics.set(logicConfig.logic_id, CreateLogic(logicConfig));
        });

        let bRlt: Boolean = true;
        this.g_logics.forEach(logic => {
            if (bRlt && !logic.Init()) {
                TradeManager.PutLog(logic.m_logicConfig.logic_id + " Init() Failed");
                bRlt = false;
            }
        });
        this.g_timerLogicReport = new UTimer(500);
        return bRlt;
    }

    static OnTick(): Boolean {
        let bRlt: Boolean = true;
        this.g_logics.forEach(logic => {
            bRlt &&= logic.OnTick();
        });
        if (this.g_timerLogicReport.Check()) this.reportLogics();
        return bRlt;
    }

    static Deinit(): void {
    }

    static SetParams(sLogic: string, lstParamsparams: Array<Array<string>>): void {
        let logic: Logic | undefined = this.g_logics.get(sLogic);
        if (logic !== undefined) {
            lstParamsparams.forEach(param => {
                logic?.SetParam(param[0], param[1]);
            })
        }
    }

    static reportLogics(): void {
        if (this.g_nLastReportedLogic >= this.g_logics.size) {
            if (this.g_logics.size < 1) return;
            this.g_nLastReportedLogic %= this.g_logics.size;
        }
        let logic: Logic | undefined = this.g_logics.get(Array.from(this.g_logics.keys())[this.g_nLastReportedLogic]);
        if (logic) this.reportLogic(logic);

        this.g_nLastReportedLogic++;
    }

    static reportLogic(logic: Logic): void {
        Setting.Report("logic", logic.m_logicConfig.logic_id, {
            params: logic.GetParamList(),
            products: logic.m_logicConfig.products,
            logic_type: logic.m_logicConfig.logic_type
        });
    }
}
