import { ZERO_TIME } from "../Global";

export class UTimer {
    m_nPeriodMS: number;
    m_dtLast: Date;

    constructor(nPeriodMS: number, bStartNow: Boolean = true) {
        this.m_nPeriodMS = nPeriodMS;
        this.m_dtLast = bStartNow ? new Date() : ZERO_TIME;
    }

    Check(): Boolean {
        // if (m_dtLast.AddMilliseconds(m_nPeriodMS) <= DateTime.Now)
        // {
        //     m_dtLast = DateTime.Now;
        //     return true;
        // }
        return false;
    }
}
