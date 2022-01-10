import { TradeManager } from '../Core';
import { ORDER_COMMAND, ORDER_KIND, ROrder, Symbol } from '../Global';
import { Logic } from './Logic'

export class TWAPLogic extends Logic {
    ex_dLotsUnit: Number = 0.01;
    ex_nOrderDelay: Number = 2000;

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

    override SetManualOrder(product: Symbol, eCmd: ORDER_COMMAND, dLots: Number, dPrice: Number, eType: ORDER_KIND): void {
    }

    override OnTick(): Boolean {
        if (!super.OnTick()) return false;


        return true;
    }

    override OnOrderFinish: ((rOrder: ROrder) => void) = (rOrder: ROrder) => {
        super.OnOrderFinish(rOrder);
    }
}
