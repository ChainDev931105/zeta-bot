import { Site } from './Site'
import { Symbol, ROrder, ORDER_KIND, ORDER_COMMAND } from "../Global";

export class ZetaFutureSite extends Site {
  constructor() {
    super();
  }

  override R_Init(): Boolean {
    return super.R_Init();
  }

  override R_Login(): Boolean {

    return super.R_Login();
  }

  override R_Logout(): void {
    super.R_Logout();
  }

  override R_OnTick(): Boolean {
    return super.R_OnTick();
  }

  override async R_UpdatePosInfo() {
    
    super.R_UpdatePosInfo();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    
    return true;
  }
}
