import { Logic } from "../Logics/Logic";

export class LogicManager {
    static g_logics: { [key: string]: Logic } = {};

    constructor() {

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
