import fs from 'fs';
import { LogicConfig, SiteConfig } from "../common/config";

export class ConfigManager {
    static CONFIG_PATH_CLIENTS: string = "./Config/clients.json";
    static CONFIG_PATH_ACCOUNTS: string = "./Config/accounts.json";
    static CONFIG_PATH_SITES: string = "./Config/sites.json";

    static g_clients: Map<string, object> = new Map<string, object>();
    static g_accounts: Map<string, object> = new Map<string, object>();
    static g_sites: Map<string, object> = new Map<string, object>();

    constructor() {

    }

    static Load(): void {
        this.loadConfigAsDic(this.CONFIG_PATH_CLIENTS, this.g_clients);
        this.loadConfigAsDic(this.CONFIG_PATH_ACCOUNTS, this.g_accounts);
        this.loadConfigAsDic(this.CONFIG_PATH_SITES, this.g_sites);
    }

    static loadConfigAsDic(sFilePath: string, dic: Map<string, object>): void {
        dic.clear();
        let data: string = fs.readFileSync(sFilePath).toString();
        let jConfig: object = JSON.parse(data);
        for (const [key, value] of Object.entries(jConfig)) {
            dic.set(key, value);
        }
    }

    static GetClients(): Array<string> {
        return Array.from(this.g_clients.keys());
    }

    static GenerateConfigs(sClientName: string): { lstLogicConfig:Array<LogicConfig>, lstSiteConfig:Array<SiteConfig>} {
        try {
            let lstLogicConfig: Array<LogicConfig> = [];
            let lstSiteConfig: Array<SiteConfig> = [];

            let jClient: any = this.g_clients.get(sClientName);
            if (jClient === undefined || !("logics" in jClient)) {
                console.log("Can't find " + sClientName + " or logics property", this.g_accounts);
                return { lstLogicConfig, lstSiteConfig };
            }

            let productMap: Map<string, Map<string, Boolean>> = new Map<string, Map<string, Boolean>>();
            let jLogics: Array<any> = jClient["logics"];

            jLogics.forEach(jLogic => {
                let logicConfig: LogicConfig = new LogicConfig();
                logicConfig.logic_id = jLogic["logic_id"];
                logicConfig.logic_type = jLogic["logic_type"];

                let jProducts: Array<any> = jLogic["products"];
                if (jProducts !== undefined) {
                    jProducts.forEach(jProduct => {
                        let account_id: string = jProduct["account_id"];
                        let symbol: string = jProduct["symbol"];
                        if (symbol.length > 0 && symbol[0] === ':') {
                            symbol = this.getSymbolName(account_id, symbol);
                        }
                        logicConfig.products.push([account_id, symbol]);
                        if (!productMap.has(account_id))
                            productMap.set(account_id, new Map<string, Boolean>());
                        productMap.get(account_id)?.set(symbol, true);
                    });
                }

                let jParams: Array<any> = jLogic["parameters"];
                if (jParams !== undefined) {
                    jParams.forEach(jParam => {
                        logicConfig.parameters.push([jParam["name"], jParam["value"]]);
                    });
                }

                lstLogicConfig.push(logicConfig);
            });
            Array.from(productMap.keys()).forEach(account_id => {
                let products: Map<string, Boolean> | undefined = productMap.get(account_id);
                if (products !== undefined)
                    lstSiteConfig.push(this.generateSiteConfig(account_id, Array.from(products.keys())));
            });
            return { lstLogicConfig, lstSiteConfig };
        }
        catch (e: any) {
            console.log("GenerateConfig Exception : " + e.message);
        }
        return { lstLogicConfig: [], lstSiteConfig: [] };
    }

    static generateSiteConfig(account_id: string, lstSymbol: Array<string>): SiteConfig {
        let siteConfig: SiteConfig = new SiteConfig();
        siteConfig.account_id = account_id;
        siteConfig.symbols = [];

        let jAccount: any | undefined = this.g_accounts.get(account_id);
        if (jAccount !== undefined) {
            if ("site_type" in jAccount) siteConfig.site_type = jAccount["site_type"];
            if ("property" in jAccount) siteConfig.property= jAccount["property"];
            if ("username" in jAccount) siteConfig.username = jAccount["username"];
            if ("password" in jAccount) siteConfig.password = jAccount["password"];
            if ("symbols" in jAccount) {
                let jSymbols: Array<Array<string>> = jAccount["symbols"];
                jSymbols.forEach(jSymbol => {
                    if (lstSymbol.includes(jSymbol[0])) siteConfig.symbols.push(jSymbol);
                });
            }
        }
        lstSymbol.forEach(symbol => {
            let bExist = false;
            siteConfig.symbols.forEach(sym => {
                if (sym[0] === symbol) bExist = true;
            });
            if (!bExist) siteConfig.symbols.push([symbol]);
        });

        return siteConfig;
    }

    static getSymbolName(account_id: string, sSymbol: string): string {
        let jAccount: any | undefined = this.g_accounts.get(account_id);
        if (jAccount === undefined) return sSymbol;

        let site_type: string = jAccount["site_type"];
        let jSite: any | undefined = this.g_sites.get(site_type);
        if (jSite === undefined) {
            let property: string = jAccount["property"];
            if (property && property.length > 0) site_type = site_type + ":" + property;
            if (!this.g_sites.has(site_type)) return sSymbol;
            jSite = this.g_sites.get(site_type);
        }
        let jSymbolMap: any = jSite["symbol_map"];
        if (!jSymbolMap) return sSymbol;
        if (sSymbol in jSymbolMap) return jSymbolMap[sSymbol];
        return sSymbol;
    }
}
