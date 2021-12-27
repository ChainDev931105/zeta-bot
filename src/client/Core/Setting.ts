
export class Setting {
    static g_nSleepCount: Number = 0;
    static g_nSleepPeriod: Number = 0;
    static g_sClientName: String = "";
    
    static ReadGlobalConfig() {
    }
    
    static Prepare(): Boolean {
        return false;
    }

    static OnTick(): Boolean {
        return false;
    }

    static Deinit(): void {
    }
}
