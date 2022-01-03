import crypto from 'crypto'
import { ROrder, ZERO_TIME } from "../Global";

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
}
