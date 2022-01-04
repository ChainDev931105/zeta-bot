
export class ReportManager {
    private g_reports: Map<string, any> = new Map<string, any>();
    private g_updated: Map<string, Boolean> = new Map<string, Boolean>();
    private g_subscribed: Map<string, Boolean> = new Map<string, Boolean>();

    Get(sKey: string): any {
        this.g_updated.set(sKey, false);
        return this.g_reports.has(sKey) ? this.g_reports.get(sKey) : {};
    }

    Set(sKey: string, report: any): void {
        if (!this.g_reports.has(sKey) || (JSON.stringify(report) !== JSON.stringify(this.g_reports.get(sKey)))) {
            this.g_updated.set(sKey, true);
            this.g_reports.set(sKey, report);
        }
    }

    Updated(sKey: string): Boolean {
        return this.g_updated.get(sKey) ? true : false;
    }

    Subscribe(sKey: string): void {
        if (this.g_subscribed.get(sKey)) return;
        this.g_subscribed.set(sKey, true);
    }

    Unsubscribe(sKey: string): void {
        if (!this.g_subscribed.has(sKey)) return;
        this.g_subscribed.delete(sKey);
    }

    GetUpdatedAll(): Array<any> {
        let rlt: Array<any> = new Array<any>();
        Array.from(this.g_subscribed.keys()).forEach(key => {
            if (this.Updated(key)) {
                rlt.push(this.Get(key));
            }
        });
        return rlt;
    }
}
