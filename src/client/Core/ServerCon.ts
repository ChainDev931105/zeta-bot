
export class ServerCon {
    static g_bConnected: Boolean = false;

    constructor() {

    }
    
    static Connect(): Boolean {
        return false;
    }

    static Disconnect(): void {

    }

    static OnTick(): void {

    }

    static SendLog(sLog: string): void {
        if (!this.g_bConnected) return;
        // TODO: 
    }

    static SendInit(): void {
        if (!this.g_bConnected) return;
        // TODO: 
    }
}
