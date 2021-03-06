import { LogicConfig } from "../../common/config";
import { AccountManager, OrderManager, TradeManager } from "../Core";
import { ORDER_ACCEPT, ORDER_COMMAND, ORDER_KIND, ROrder, Symbol, ZERO_TIME } from "../Global";
import { RATE_CACHE_SIZE, RATE_DIR, RATE_RECORD_PERIOD_MS } from "../Global/Constants";
import { DateToStr, UFile } from "../Utils";

export class Logic {
  m_logicConfig: LogicConfig = new LogicConfig();
  m_lstProdut: Array<Symbol> = new Array<Symbol>();
  m_dicParam: Map<string, string> = new Map<string, string>();

  m_sRateFile: string = "";
  m_sPrvRateLine: string = "";
  m_rateCache: Array<string> = [];
  m_dtLastRateRecord: Date = ZERO_TIME;

  ex_sRateFolder: string = "";
  ex_dLots: number = 0;
  ex_nNewOrderCnt: number = 0;
  ex_eOrderAccept: ORDER_ACCEPT = ORDER_ACCEPT.StopOrder;
  ex_nStepCnt: number = 1;

  constructor() {
    this.m_dicParam.clear();
  }

  Init(): Boolean {
    this.m_lstProdut = [];
    this.m_logicConfig.products.forEach(product => {
      let symbol: Symbol | undefined = AccountManager.g_accounts.get(product[0])?.m_symbols.get(product[1]);
      if (symbol !== undefined) this.m_lstProdut.push(symbol);
    });
    
    if (this.ex_sRateFolder.length > 0) {
      if (!UFile.DirExists(RATE_DIR)) UFile.CreateDir(RATE_DIR);
      const sRatePath: string = RATE_DIR + this.ex_sRateFolder + "/";
      if (!UFile.DirExists(sRatePath)) UFile.CreateDir(sRatePath);
      this.m_sRateFile = sRatePath + DateToStr(new Date(), "yyyyMMddHH") + ".csv";
    }

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
        try {
          this.ex_eOrderAccept = (<any>ORDER_ACCEPT)[parseInt(sValue)];
        }
        catch {
          this.ex_eOrderAccept = (<any>ORDER_ACCEPT)[sValue];
        }
      }
    }
    catch (e: any) {
      bSuccess = false;
    }
    if (bSuccess) {
      this.m_dicParam.set(sName, sValue);
    }
    return bSuccess;
  }

  SetManualOrder(product: Symbol, eCmd: ORDER_COMMAND, dLots: number, dPrice: number, eKind: ORDER_KIND): void {
    TradeManager.PutLog([
      "<ManualOrder>",
      this.m_logicConfig.logic_id,
      product.m_sSymbolName,
      eCmd,
      dLots,
      dPrice,
      eKind
    ].join(' '));
  }

  OnTick(): Boolean {
    if (this.ex_sRateFolder.length > 0) {
      this.recordRate();
    }

    return true;
  }

  GetParamList(): any {
    let rlt: any = {};
    Array.from(this.m_dicParam.keys()).forEach(sName => {
      rlt[sName] = this.m_dicParam.get(sName);
    });
    return rlt;
  }

  FindSymbol(sProduct: string): Symbol | undefined {
    let symbol: Symbol | undefined = undefined;
    this.m_lstProdut.forEach(product => {
      if (product.m_site.m_siteConfig.account_id + "_" + product.m_sSymbolName === sProduct) {
        symbol = product;
      }
    });
    return symbol;
  }

  AddtionalReport(): any {
    return {};
  }

  OnOrderFinish: ((rOrder: ROrder) => void) = (rOrder: ROrder) => {
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

  protected recordRate(): void {
    let rates: number[] = [];
    this.m_lstProdut.forEach(product => {
      rates.push(product.Ask());
      rates.push(product.Bid());
    });
    const dtCur: Date = new Date();
    let sLine: string = rates.join(',');
    if (this.m_sPrvRateLine !== sLine) {
      this.m_sPrvRateLine = sLine;
      sLine = DateToStr(dtCur, "yyyy-MM-dd HH:mm:ss.fff") + "," + sLine;
      this.m_rateCache.push(sLine);
      if (this.m_rateCache.length >= RATE_CACHE_SIZE || 
        (dtCur.valueOf() - this.m_dtLastRateRecord.valueOf()) > RATE_RECORD_PERIOD_MS) {
        this.m_dtLastRateRecord = dtCur;
        UFile.AppendAllLines(this.m_sRateFile, this.m_rateCache);
        this.m_rateCache = [];
      }
    }
  }
}
