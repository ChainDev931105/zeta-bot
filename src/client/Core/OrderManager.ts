import crypto from 'crypto'
import { TradeManager } from '.';
import { EP, ROrder, ZERO_TIME } from "../Global";

export class OrderManager {
  static g_procOrders: Map<string, ROrder> = new Map<string, ROrder>();

  constructor() {

  }
  
  static Prepare(): Boolean {
    this.g_procOrders.clear();
    return true;
  }

  static OnTick(): Boolean {
    return true;
  }

  static Deinit(): void {
  }

  static OrderProcess(rOrder: ROrder): void  {
    rOrder.m_dtSigTime = new Date();
    rOrder.m_symbol.CounterPlus();
    rOrder.m_sMagicNumber = crypto.randomBytes(8).toString('hex').toUpperCase() + "_" + rOrder.m_symbol.m_sSymbolName;
    this.g_procOrders.set(rOrder.m_sMagicNumber, rOrder);

    rOrder.m_symbol.m_site.R_OrderSend(rOrder);
  }

  static OrderFinished(sMagicNumber: string, dExcLots: number, dExcTotPrice: number) {
    let rOrder: ROrder | undefined = this.g_procOrders.get(sMagicNumber);
    if (rOrder === undefined) {
      TradeManager.PutLog([
        "Unexpected OrderFinished",
        sMagicNumber,
        dExcLots,
        dExcTotPrice
      ].join(''));
    }
    else {
      if (dExcLots > EP) {
        rOrder.m_dExcPrice = (rOrder.m_dExcPrice * rOrder.m_dExcLots + dExcTotPrice) / (rOrder.m_dExcLots + dExcLots);
        rOrder.m_dExcLots += dExcLots;
      }
      rOrder.m_dtExcTime = new Date();
      this.recordOrder(rOrder);
      rOrder.m_symbol.CounterMinus();
      this.g_procOrders.delete(sMagicNumber);
      rOrder.m_logic?.OnOrderFinish(rOrder);
    }
  }

  private static recordOrder(rOrder: ROrder): void {
    // TODO:
  }
}
