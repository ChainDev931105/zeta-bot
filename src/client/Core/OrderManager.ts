
export class OrderManager {
    constructor() {

    }
    
    static Prepare(): Boolean {
        return true;
    }

    static OnTick(): Boolean {
        return true;
    }

    static Deinit(): void {
    }
}
