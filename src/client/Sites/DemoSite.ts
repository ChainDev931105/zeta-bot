import { ORDER_COMMAND, ORDER_KIND, ROrder } from '../Global';
import { Site } from './Site'

export class DemoSite extends Site {
  m_TimerRate: NodeJS.Timer | null = null;
  
  constructor() {
    super();
  }

  override R_Login(): Boolean {
    this.m_TimerRate = setInterval(() => {
      this.m_symbols.forEach(symbol => {
        let dAsk = (symbol.Ask() === 0) ? ((Math.random() + 1) * (Math.random() + 1) * (Math.random() + 1) * 1000) : symbol.Ask();
        dAsk += (Math.random() - 0.5) * dAsk / 1000;
        dAsk = Math.round(dAsk * 1000) / 1000;
        let dBid = dAsk - 1;
        this.OnRateUpdate(symbol.m_sSymbolName, dAsk, dBid, 1, 1);
      });
    }, 1500);

    return super.R_Login();
  }

  override R_Logout(): void {
    if (this.m_TimerRate !== null) clearInterval(this.m_TimerRate);
    super.R_Logout();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    let sType: string = "";
    if (rOrder.m_eCmd === ORDER_COMMAND.Buy || rOrder.m_eCmd === ORDER_COMMAND.SellClose) sType = "buy-";
    else sType = "sell-";
    if (rOrder.m_eKind === ORDER_KIND.Limit) sType += "limit";
    else if (rOrder.m_eKind === ORDER_KIND.Market) sType += "market";
    setTimeout(() => {
      this.OnOrderUpdate(
        rOrder.m_symbol.m_sSymbolName,
        rOrder.m_dSigLots,
        rOrder.m_dSigPrice
      );
    }, 1000);
    return true;
  }
}
