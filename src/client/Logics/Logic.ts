import { LogicConfig } from "../../common/config";
import { Symbol } from "../Global/Symbol";

export class Logic {
    m_logicConfig: LogicConfig = new LogicConfig();
    m_lstProdut: Array<Symbol> = new Array<Symbol>();

    m_sRateFile: string = "";
    m_sPrvRateLine: string = "";
    m_rateCache: Array<string> = [];
    m_dtLastRateRecord: Date = new Date();

    ex_sRateFolder: string = "";
    ex_dLots: Number = 0;
    ex_nNewOrderCnt: Number = 0;
    // ORDER_ACCEPT ex_eOrderAccept = ORDER_ACCEPT.StopOrder;
    ex_nStepCnt: Number = 1;

    static CreateLogic(logicConfig: LogicConfig): Logic {
        // Logic logic = null;
        // if (logicConfig.logic_type == "Arb1LegLogic") logic = new Arb1LegLogic();
        // else
        // {
        //     TradeManager.PutLog("Unknown site type : " + logicConfig.logic_type);
        //     logic = new Logic();
        // }
        // logic.m_logicConfig = logicConfig;

        // foreach (var param in logicConfig.parameters)
        // {
        //     logic.SetParam(param[0], param[1]);
        // }
        // return logic;
        return new Logic();
    }

    Init(): Boolean {
        this.m_lstProdut.clear();
        foreach (var product in m_logicConfig.products)
        {
            m_lstProdut.Add(AccountManager.g_accounts[product[0]].m_symbols[product[1]]);
        }
        if (ex_sRateFolder.Length > 0)
        {
            if (!Directory.Exists(Global.RATE_DIR)) Directory.CreateDirectory(Global.RATE_DIR);
            string sRatePath = Global.RATE_DIR + ex_sRateFolder + "\\";
            if (!Directory.Exists(sRatePath)) Directory.CreateDirectory(sRatePath);
            m_sRateFile = sRatePath + DateTime.Now.ToString("yyyyMMdd") + ".csv";
        }
        return true;
    }

    SetParam(sName: string, sValue: string): Boolean {
        bool bSuccess = true;
        if (sName == "ex_sRateFolder") ex_sRateFolder = sValue;
        else if (sName == "ex_dLots") bSuccess = double.TryParse(sValue, out ex_dLots);
        else if (sName == "ex_nNewOrderCnt") bSuccess = int.TryParse(sValue, out ex_nNewOrderCnt);
        else if (sName == "ex_nStepCnt") bSuccess = int.TryParse(sValue, out ex_nStepCnt);
        else if (sName == "ex_eOrderAccept")
        {
            try
            {
                ex_eOrderAccept = (ORDER_ACCEPT)int.Parse(sValue);
            }
            catch { bSuccess = Enum.TryParse(sValue, true, out ex_eOrderAccept); }
        }
        return bSuccess;
    }

    public virtual bool OnTick()
    {
        if (ex_sRateFolder.Length > 0)
        {
            recordRate();
        }
        return true;
    }

    private void recordRate()
    {
        string sLine = "";
        foreach (var product in m_lstProdut)
        {
            sLine += string.Format(",{0},{1}", product.Ask(), product.Bid());
        }
        if (m_sPrvRateLine != sLine)
        {
            m_sPrvRateLine = sLine;
            sLine = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff") + sLine;
            m_rateCache.Add(sLine);
            if (m_rateCache.Count >= Global.RATE_CACHE_SIZE || 
                DateTime.Now >= m_dtLastRateRecord.AddMilliseconds(Global.RATE_RECORD_PERIOD_MS))
            {
                m_dtLastRateRecord = DateTime.Now;
                File.AppendAllLines(m_sRateFile, m_rateCache);
                m_rateCache.Clear();
            }
        }
    }
}
