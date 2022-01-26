import { TradeManager } from '../Core';
import { EP, ORDER_COMMAND, ORDER_KIND, ROrder, Symbol, ZERO_TIME } from '../Global';
import { Logic } from './Logic'
import { UTimer } from '../Utils';

export class MarketMakerLogic extends Logic {
  constructor() {
    super();
  }

  override SetParam(sName: string, sValue: string): Boolean {
    let bSuccess: Boolean = true;
    try {
    }
    catch (e: any) {
      bSuccess = false;
    }
    return bSuccess && super.SetParam(sName, sValue);
  }

  override OnTick(): Boolean {
    if (!super.OnTick()) return false;

    return true;
  }

  override OnOrderFinish: ((rOrder: ROrder) => void) = (rOrder: ROrder) => {
  }

  override AddtionalReport(): any {
  }
}
