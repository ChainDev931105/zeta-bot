import { ZERO_TIME } from "../Global";

export class UTimer {
  m_nPeriodMS: number;
  m_dtLast: Date;

  constructor(nPeriodMS: number, bStartNow: Boolean = true) {
    this.m_nPeriodMS = nPeriodMS;
    this.m_dtLast = bStartNow ? new Date() : ZERO_TIME;
  }

  Check(): Boolean {
    if ((new Date()).valueOf() - this.m_dtLast.valueOf() >= this.m_nPeriodMS) {
      this.m_dtLast = new Date();
      return true;
    }
    return false;
  }
}
