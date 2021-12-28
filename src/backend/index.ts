import express from 'express'
import { LogicConfig, SiteConfig } from '../common/config';
import { ConfigManager } from './ConfigManager';

require('dotenv').config()

const PORT = process.env.BACKEND_PORT;
const app = express();

ConfigManager.Load();

app.get("/config", async function (req: any, res: any) {
    let sClientName: string = req.query["client"];
    let {lstLogicConfig, lstSiteConfig}: {lstLogicConfig: Array<LogicConfig>, lstSiteConfig: Array<SiteConfig>} = 
        ConfigManager.GenerateConfigs(sClientName);
    res.json({
        success: true,
        data: {
            sites: lstSiteConfig,
            logics: lstLogicConfig
        }
    });
});


app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
});
