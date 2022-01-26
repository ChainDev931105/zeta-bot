import { TradeManager } from '../Core';
import { EP, ORDER_COMMAND, ORDER_KIND, ROrder, Symbol, ZERO_TIME } from '../Global';
import { Logic } from './Logic'
import { UTimer } from '../Utils';

export class TWAPLogic extends Logic {
  ex_dLotsUnit: number = 0.01;
  ex_nOrderDelay: number = 2000;

  m_lstTWAPOrder: Array<TWAPOrder> = [];
  m_lstFinishedTWAPOrder: Array<TWAPOrder> = [];

  constructor() {
    super();
  }

  override SetParam(sName: string, sValue: string): Boolean {
    let bSuccess: Boolean = true;
    try {
      if (sName === "ex_dLotsUnit") this.ex_dLotsUnit = parseFloat(sValue);
      else if (sName === "ex_nOrderDelay") this.ex_nOrderDelay = parseInt(sValue);
    }
    catch (e: any) {
      bSuccess = false;
    }
    return bSuccess && super.SetParam(sName, sValue);
  }

  override SetManualOrder(product: Symbol, eCmd: ORDER_COMMAND, dLots: number, dPrice: number, eKind: ORDER_KIND): void {
    let twapOrder: TWAPOrder = new TWAPOrder(
      product,
      eCmd,
      dLots,
      dPrice,
      eKind,
      this.ex_dLotsUnit,
      this.ex_nOrderDelay
    );
    twapOrder.Start();
    if (this.m_lstTWAPOrder.length > 0) { // currently, TWAP order should be excuted one by one
      TradeManager.PutLog("currently, TWAP order should be excuted one by one");
      return;
    }
    this.m_lstTWAPOrder.push(twapOrder);
  }

  override OnTick(): Boolean {
    if (!super.OnTick()) return false;
    
    // filter finished orders
    this.m_lstFinishedTWAPOrder = this.m_lstFinishedTWAPOrder.concat(
      this.m_lstTWAPOrder.filter(twapOrder => twapOrder.IsFinished()));
    this.m_lstTWAPOrder = this.m_lstTWAPOrder.filter(twapOrder => !twapOrder.IsFinished());

    this.m_lstTWAPOrder.forEach(twapOrder => {
      if (twapOrder.Active()) {
        let rOrder: ROrder = twapOrder.GenerateOrder();
        this.OrderSend(rOrder);
      }
    });

    return true;
  }

  override OnOrderFinish: ((rOrder: ROrder) => void) = (rOrder: ROrder) => {
    this.m_lstTWAPOrder.forEach(twapOrder => {
      if (twapOrder.lstSubOrder.includes(rOrder)) {
        twapOrder.OnSubOrderExcuted(rOrder);
        return;
      }
    });
  }

  override AddtionalReport(): any {
    let finishedOrders = this.m_lstFinishedTWAPOrder.map(twapOrder => twapOrder.Report());
    let processingOrders = this.m_lstTWAPOrder.map(twapOrder => twapOrder.Report());
    return {...super.AddtionalReport, finishedOrders, processingOrders};
  }
}

class TWAPOrder {
  product: Symbol;
  eCmd: ORDER_COMMAND;
  dRemainLots: number;
  dLimitPrice: number;
  eKind: ORDER_KIND;
  dLotsUnit: number;
  timer: UTimer;
  dtStarted: Date;
  
  dTotExcLots: number = 0;
  dTotExcPrice: number = 0;
  bStarted: Boolean = false;
  bFinished: Boolean = false;
  lstSubOrder: Array<ROrder> = [];

  constructor(
    _product: Symbol,
    _eCmd: ORDER_COMMAND,
    _dLots: number,
    _dPrice: number,
    _eKind: ORDER_KIND,
    _dLotsUnit: number,
    _nOrderDelay: number
  ) {
    this.product = _product;
    this.eCmd = _eCmd;
    this.dRemainLots = _dLots;
    this.dLimitPrice = _dPrice;
    this.eKind = _eKind;
    this.dLotsUnit = _dLotsUnit;
    this.timer = new UTimer(_nOrderDelay);
    this.dtStarted = ZERO_TIME;
  }

  Start(): void {
    this.bStarted = true;
    this.timer.m_dtLast = ZERO_TIME;
    this.dtStarted = new Date();
  }

  Active(): Boolean {
    return this.bStarted && !this.bFinished && (this.dRemainLots > EP) && this.timer.Check();
  }

  IsFinished(): Boolean {
    if (this.dRemainLots < EP) this.bFinished = true;
    return this.bFinished;
  }

  GenerateOrder(): ROrder {
    let rOrder: ROrder = new ROrder(this.product);
    rOrder.m_eCmd = this.eCmd;
    rOrder.m_eKind = this.eKind;
    rOrder.m_dSigLots = Math.min(this.dRemainLots, this.dLotsUnit);
    rOrder.m_dSigPrice = this.dLimitPrice;
    this.lstSubOrder.push(rOrder);

    return rOrder;
  }

  OnSubOrderExcuted(rOrder: ROrder): void {
    this.dTotExcLots += rOrder.m_dExcLots;
    this.dTotExcPrice += rOrder.m_dExcPrice * rOrder.m_dExcLots;
    this.dRemainLots -= rOrder.m_dExcLots;
    if (this.dRemainLots < EP) this.bFinished = true;
  }

  Report(): any {
    return {
      symbol: this.product.GetWholeSymbol(),
      command: this.eCmd,
      remainLots: this.dRemainLots,
      limitPrice: this.dLimitPrice,
      kind: this.eKind,
      lotsUnit: this.dLotsUnit,
      totExcLots: this.dTotExcLots,
      totExcPrice: this.dTotExcPrice,
      subOrders: this.lstSubOrder.map(subOrder => ({
        lots: subOrder.m_dExcLots,
        price: subOrder.m_dExcPrice,
        time: subOrder.m_dtExcTime
      }))
    };
  }
}
