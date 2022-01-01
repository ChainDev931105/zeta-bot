import { Site } from "../Sites";
import { EP } from "./";

export class Rate {
    dt: Date = new Date();
    dAsk: number = 0;
    dBid: number = 0;
    dAskVolume: number = 0;
    dBidVolume: number = 0;

    IsValidRate(): Boolean {
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
    dtStart: Date = new Date();
    dtEnd: Date = new Date();
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
    m_site: Site | null = null;
    m_sSymbolName: string = "";

    m_rate: Rate = new Rate();
    m_dRealLots: number = 0;

    SetRate(dAsk: number, dBid: number, dAskVolume: number, dBidVolume: number): void {
        let dt: Date = new Date();
        let rate: Rate = new Rate();
        rate.dt = dt;
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

    IsWorkTime(): Boolean {
        return true;
    }

    IsValidRate(): Boolean { return this.m_rate.IsValidRate(); }
    Ask(): number { return this.m_rate.dAsk; }
    Bid(): number { return this.m_rate.dBid; }
    Mid(): number { return (this.m_rate.dAsk + this.m_rate.dBid) / 2; }
}
