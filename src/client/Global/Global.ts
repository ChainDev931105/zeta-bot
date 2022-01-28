import { Site } from "../Sites";
import { ORDER_COMMAND, ORDER_KIND } from "./Enums";
import { EP, ZERO_TIME } from "./Constants";
import { Logic } from "../Logics";

export class Rate {
  dt: Date = ZERO_TIME;
  dAsk: number = 0;
  dBid: number = 0;
  dAskVolume: number = 0;
  dBidVolume: number = 0;

  IsValidRate(): Boolean {
    return true; // TODO: remove this line in real mode
    if (this.dAsk < EP || this.dBid < EP) return false;
    if (this.dAsk < this.dBid) return false;
    if (this.dAsk - this.dBid > (this.dAsk + this.dBid) * 0.1) return false;
    return true;
  }

  IsDifferentRate(rate: Rate): Boolean {
    return Math.abs(rate.dAsk - this.dAsk) > EP || Math.abs(rate.dBid - this.dBid) > EP;
  }
}

export class OHLC {
  dtStart: Date = ZERO_TIME;
  dtEnd: Date = ZERO_TIME;
  dOpenAsk: number = 0;
  dHighAsk: number = 0;
  dLowAsk: number = 0;
  dCloseAsk: number = 0;
  dOpenBid: number = 0;
  dHighBid: number = 0;
  dLowBid: number = 0;
  dCloseBid: number = 0;
}

export class Symbol {
  m_site: Site;
  m_sSymbolName: string = "";

  m_rate: Rate = new Rate();
  m_dRealLots: number = 0;
  m_lstDetailInfo: Array<string> = [];

  private m_nCounter: number = 0;

  constructor(site: Site, sSymbolName: string) {
    this.m_site = site;
    this.m_sSymbolName = sSymbolName;
  }

  SetRate(dAsk: number, dBid: number, dAskVolume: number, dBidVolume: number): void {
    const rate: Rate = new Rate();
    rate.dt = new Date();
    rate.dAsk = dAsk;
    rate.dBid = dBid;
    rate.dAskVolume = dAskVolume;
    rate.dBidVolume = dBidVolume;
    if (rate.IsValidRate() && rate.IsDifferentRate(this.m_rate)) this.m_rate = rate;
  }

  GetRate(): Rate {
    return this.m_rate;
  }

  GetRealLots(): number {
    return this.m_dRealLots;
  }

  GetWholeSymbol(): string {
    return this.m_site.m_siteConfig.account_id + "_" + this.m_sSymbolName;
  }

  IsWorkTime(): Boolean {
    return true;
  }

  CounterCheck(): Boolean {
    return this.m_nCounter > 0;
  }

  CounterPlus(): void {
    this.m_nCounter++;
  }

  CounterMinus(): void {
    this.m_nCounter--;
  }

  IsValidRate(): Boolean { return this.m_rate.IsValidRate(); }
  Ask(): number { return this.m_rate.dAsk; }
  Bid(): number { return this.m_rate.dBid; }
  AskVolume(): number { return this.m_rate.dAskVolume; }
  BidVolume(): number { return this.m_rate.dBidVolume; }
  Mid(): number { return (this.m_rate.dAsk + this.m_rate.dBid) / 2; }
}

export class TimeFrame {

}

export class ROrder {
  m_logic: Logic | null = null;
  m_symbol: Symbol;
  m_nStep: number = 0;

  m_eCmd: ORDER_COMMAND = 0;
  m_eKind: ORDER_KIND = 0;

  m_dSigLots: number = 0;
  m_dSigPrice: number = 0;
  m_dtSigTime: Date = ZERO_TIME;
  m_dExcLots: number = 0;
  m_dExcPrice: number = 0;
  m_dtExcTime: Date = ZERO_TIME;

  m_sMagicNumber: string = "";
  m_dClosedProfit: number = 0;

  constructor(symbol: Symbol) {
    this.m_symbol = symbol;
  }
}

export class AccountInfo {
  m_dBalance: number = 0;
  m_dEquity: number = 0;
  m_dMargin: number = 0;
  m_subBalances: Array<any> = [];
}
