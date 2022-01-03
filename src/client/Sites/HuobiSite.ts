import { Site } from './Site'
import { Symbol, ROrder } from "../Global";

export class HuobiSite extends Site {
    constructor() {
        super();
    }

    R_Init(): Boolean {
        return super.R_Init();
    }

    R_Login(): Boolean {
        return super.R_Login();
    }

    R_Logout(): void {
        super.R_Logout();
    }

    R_OnTick(): Boolean {
        return super.R_OnTick();
    }

    R_UpdatePosInfo(): void {
        super.R_UpdatePosInfo();
    }

    R_OrderSend(rOrder: ROrder): Boolean {
        return super.R_OrderSend(rOrder);
    }
}
