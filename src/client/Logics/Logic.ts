import { LogicConfig } from "../../common/config";
import { OrderManager, TradeManager } from "../Core";
//import { AccountManager } from "../Core";
import { ROrder, Symbol, ZERO_TIME } from "../Global";

export class Logic {
    m_logicConfig: LogicConfig = new LogicConfig();
    m_lstProdut: Array<Symbol> = new Array<Symbol>();

    m_sRateFile: string = "";
    m_sPrvRateLine: string = "";
    m_rateCache: Array<string> = [];
    m_dtLastRateRecord: Date = ZERO_TIME;

    ex_sRateFolder: string = "";
    ex_dLots: Number = 0;
    ex_nNewOrderCnt: Number = 0;
    // ORDER_ACCEPT ex_eOrderAccept = ORDER_ACCEPT.StopOrder;
    ex_nStepCnt: Number = 1;

    constructor() {

    }

    Init(): Boolean {
        this.m_lstProdut = [];
        // this.m_logicConfig.products.forEach(product => {
        //     let symbol: Symbol | undefined = AccountManager.g_accounts.get(product[0])?.m_symbols.get(product[1]);
        //     if (symbol !== undefined) this.m_lstProdut.push(symbol);
        // });
        
        // TODO: init for rate record

        // if (this.ex_sRateFolder.length > 0)
        // {
        //     if (!Directory.Exists(Global.RATE_DIR)) Directory.CreateDirectory(Global.RATE_DIR);
        //     string sRatePath = Global.RATE_DIR + ex_sRateFolder + "\\";
        //     if (!Directory.Exists(sRatePath)) Directory.CreateDirectory(sRatePath);
        //     m_sRateFile = sRatePath + DateTime.Now.ToString("yyyyMMdd") + ".csv";
        // }
        return true;
    }

    SetParam(sName: string, sValue: string): Boolean {
        let bSuccess: Boolean = true;
        try {
            if (sName == "ex_sRateFolder") this.ex_sRateFolder = sValue;
            else if (sName == "ex_dLots") this.ex_dLots = parseFloat(sValue);
            else if (sName == "ex_nNewOrderCnt") this.ex_nNewOrderCnt = parseInt(sValue);
            else if (sName == "ex_nStepCnt") this.ex_nStepCnt = parseInt(sValue);
            else if (sName == "ex_eOrderAccept") {
                // TODO: 
                // try
                // {
                //     ex_eOrderAccept = (ORDER_ACCEPT)int.Parse(sValue);
                // }
                // catch { bSuccess = Enum.TryParse(sValue, true, out ex_eOrderAccept); }
            }
        }
        catch (e: any) {
            bSuccess = false;
        }
        return bSuccess;
    }

    OnTick(): Boolean {
        // if (this.ex_sRateFolder.length > 0) {
        //     recordRate();
        // }
        return true;
    }

    protected CheckProcessing(): Boolean {
        let bRlt = false;
        this.m_lstProdut.forEach(product => {
            if (product.CounterCheck()) bRlt = true;
        });
        return bRlt;
    }

    protected OrderSend(rOrder: ROrder): void {
        if (rOrder.m_logic === null) rOrder.m_logic = this;
        TradeManager.PutLog([
            "<OrderSend>", 
            rOrder.m_logic.m_logicConfig.logic_id,
            rOrder.m_symbol.m_sSymbolName,
            rOrder.m_eCmd,
            rOrder.m_eKind,
            rOrder.m_dSigPrice,
            rOrder.m_dSigLots
        ].join(' '));
        OrderManager.OrderProcess(rOrder);
    }

    recordRate(): void {
        // TODO: 
    }
}
