import { Exchange, types } from '@zetamarkets/sdk';
import { TradeManager } from '../Core';
import { EP, ORDER_COMMAND, ORDER_KIND, ROrder, Symbol, ZERO_TIME } from '../Global';
import { Logic } from './Logic'
import { UTimer, round } from '../Utils';
import { ZetaFutureSite, ZFSymbol, OrderReq } from '../Sites/ZetaFutureSite';

// ! --- This logic is only for ZetaFutureSite --- !
export class MarketMakerLogic extends Logic {
  m_zfSite: ZetaFutureSite | undefined;
  m_tickTimer: UTimer;
  m_zfSymbol: ZFSymbol | undefined;

  ex_nPluseFrequency: number = 5000;
  ex_dLotsUnit: number = 0.01;
  ex_dParamR: number = 0;
  ex_dSpreadPercent: number = 0.002;
  ex_nDecimalPlaces: number = 2;

  m_lstOrderReq: Array<OrderReq> = [];

  constructor() {
    super();
    this.m_tickTimer = new UTimer(this.ex_nPluseFrequency);
  }

  override SetParam(sName: string, sValue: string): Boolean {
    let bSuccess: Boolean = true;
    try {
      if (sName === "ex_nPluseFrequency") {
        this.ex_nPluseFrequency = parseInt(sValue);
        this.m_tickTimer.m_nPeriodMS = this.ex_nPluseFrequency;
      }
      else if (sName === "ex_dLotsUnit") {
        this.ex_dLotsUnit = parseFloat(sValue);
      }
      else if (sName === "ex_dParamR") {
        this.ex_dParamR = parseFloat(sValue);
      }
      else if (sName === "ex_dSpreadPercent") {
        this.ex_dSpreadPercent = parseFloat(sValue);
      }
      else if (sName === "ex_nDecimalPlaces") {
        this.ex_nDecimalPlaces = parseInt(sValue);
      }
    }
    catch (e: any) {
      bSuccess = false;
    }
    return bSuccess && super.SetParam(sName, sValue);
  }

  override Init(): Boolean {
    if (!super.Init()) return false;
    if (this.m_lstProdut.length > 0 && this.m_lstProdut[0].m_site.m_siteConfig.site_type === "ZetaFutureSite") {
      this.m_zfSite = <ZetaFutureSite>this.m_lstProdut[0].m_site;
      this.m_zfSymbol = this.m_zfSite.m_zfSymbols.get(this.m_lstProdut[0].m_sSymbolName);
    }
    else return false;
    return true;
  }

  override OnTick(): Boolean {
    if (!super.OnTick()) return false;
    if (this.m_zfSite === undefined) return false;
    if (this.m_zfSymbol === undefined) this.m_zfSymbol = this.m_zfSite.m_zfSymbols.get(this.m_lstProdut[0].m_sSymbolName);
    if (this.m_zfSymbol === undefined) return false;

    if (this.checkExpired()) return true;
    if (this.m_zfSite.m_nProcessCnt > 0) {
      console.log("processing... " + this.m_zfSite.m_nProcessCnt);
      return true;
    }
    
    let dExpectedPrice: number = this.calcExpectedPrice();
    
    // ! --- don't correct like "dExpectedPrice * (1 + ...)", because decimal precision --- !
    let dExpectedAsk: number = round(dExpectedPrice + (dExpectedPrice * this.ex_dSpreadPercent / 2), this.ex_nDecimalPlaces);
    let dExpectedBid: number = round(dExpectedPrice - (dExpectedPrice * this.ex_dSpreadPercent / 2), this.ex_nDecimalPlaces);

    if (!this.m_tickTimer.Check()) return true;

    this.initOrders();

    // bids
    if (this.m_zfSymbol.myBids.length > 1) {
      for (let i = 1; i < this.m_zfSymbol.myBids.length; i++) {
        this.m_lstOrderReq.push(<OrderReq>{
          type: "cancel",
          order: this.m_zfSymbol.myBids[i]
        });
      }
    }
    if (this.m_zfSymbol.myBids.length < 1) {
      this.m_lstOrderReq.push(<OrderReq>{
        type: "place",
        price: dExpectedBid,
        size: this.ex_dLotsUnit,
        side: types.Side.BID
      });
    }
    else {
      this.m_lstOrderReq.push(<OrderReq>{
        type: "cancelAndPlace",
        order: this.m_zfSymbol.myBids[0],
        price: dExpectedBid,
        size: this.ex_dLotsUnit,
        side: types.Side.BID
      });
    }

    // asks
    if (this.m_zfSymbol.myAsks.length > 1) {
      for (let i = 1; i < this.m_zfSymbol.myAsks.length; i++) {
        this.m_lstOrderReq.push(<OrderReq>{
          type: "cancel",
          order: this.m_zfSymbol.myAsks[i]
        });
      }
    }
    if (this.m_zfSymbol.myAsks.length < 1) {
      this.m_lstOrderReq.push(<OrderReq>{
        type: "place",
        price: dExpectedAsk,
        size: this.ex_dLotsUnit,
        side: types.Side.ASK
      });
    }
    else {
      this.m_lstOrderReq.push(<OrderReq>{
        type: "cancelAndPlace",
        order: this.m_zfSymbol.myAsks[0],
        price: dExpectedAsk,
        size: this.ex_dLotsUnit,
        side: types.Side.ASK
      });
    }

    this.processOrders();

    return true;
  }

  override OnOrderFinish: ((rOrder: ROrder) => void) = (rOrder: ROrder) => {
  }

  override AddtionalReport(): any {
    let spotPrice: number = parseFloat((this.m_zfSymbol ? this.m_zfSymbol.theoPrice : 0).toFixed(this.ex_nDecimalPlaces + 3));
    let expectedPrice: number = parseFloat(this.calcExpectedPrice().toFixed(this.ex_nDecimalPlaces + 3));
    let asks: string = JSON.stringify(this.m_zfSymbol?.myAsks.map(ask => ({ price: ask.price, size: ask.size })));
    let bids: string = JSON.stringify(this.m_zfSymbol?.myBids.map(bid => ({ price: bid.price, size: bid.size })));
    return { ...super.AddtionalReport, spotPrice, expectedPrice, asks, bids };
  }

  private calcExpectedPrice(): number {
    // F = S * (e ^ (r * T))
    if (!this.m_zfSymbol) return 0;
    let dRemainDay = (this.m_zfSymbol.expireTS - Exchange.clockTimestamp) / 86400;
    return this.m_zfSymbol.theoPrice * Math.exp(dRemainDay * this.ex_dParamR);
  }

  private checkExpired(): Boolean {
    return (this.m_zfSymbol !== undefined) && (this.m_zfSymbol.expireTS < Exchange.clockTimestamp);
  }

  private initOrders(): void {
    this.m_lstOrderReq = [];
  }

  private processOrders(): void {
    let lstOrderReq = [...this.m_lstOrderReq];
    if (lstOrderReq.length > 0) {
      TradeManager.PutLog("ZF OrderReq: " + JSON.stringify(lstOrderReq));
    }
    this.m_zfSite?.sendOrders(lstOrderReq);
    this.m_lstOrderReq = [];
  }
}
