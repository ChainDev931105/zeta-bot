
export class UTimer {
    m_nPeriodMS: number = 0;
    // DateTime m_dtLast;

    constructor(nPeriodMS: number, bStartNow: Boolean = true) {
        this.m_nPeriodMS = nPeriodMS;
        // this.m_dtLast = bStartNow ? new DateTime() : DateTime.Now;
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
