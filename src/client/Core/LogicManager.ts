import { Logic } from "../Logics/Logic";
import { Setting, TradeManager } from "./";

export class LogicManager {
    static g_logics: Map<string, Logic> = new Map<string, Logic>();

    constructor() {

    }
    
    static Prepare(): Boolean {
        this.g_logics.clear();
        Setting.g_lstLogicConfig.forEach(logicConfig => {
            this.g_logics.set(logicConfig.logic_id, Logic.CreateLogic(logicConfig));
        });

        let bRlt: Boolean = true;
        console.log(this.g_logics);
        this.g_logics.forEach(logic => {
            console.log(logic);
            if (bRlt && !logic.Init()) {
                TradeManager.PutLog(logic.m_logicConfig.logic_id + " Init() Failed");
                bRlt = false;
            }
        });
        console.log("hello2", bRlt);
        return bRlt;
    }

    static OnTick(): Boolean {
        let bRlt: Boolean = true;
        this.g_logics.forEach(logic => {
            bRlt &&= logic.OnTick();
        });
        return bRlt;
    }

    static Deinit(): void {
    }
}
