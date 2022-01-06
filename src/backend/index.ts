import express from 'express'
import expressWs from 'express-ws';
import { LogicConfig, SiteConfig } from '../common/config';
import { ConfigManager } from './ConfigManager';
import { ReportManager } from './ReportManager';

require('dotenv').config()

const PORT = process.env.BACKEND_PORT;
const app = expressWs(express()).app;
const reportManager: ReportManager = new ReportManager();

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

app.ws('/up', function(ws, req) {
    ws.on('message', function(msg) {
        try {
            const jMsg: any = JSON.parse(msg.toString());
            if (jMsg["command"] === "report") {
                reportManager.Set(jMsg["report"]["key"], jMsg["report"]);
            }
        }
        catch {
            console.log(" --ws-- up unexpected message : ", msg);
        }
    });
});

app.ws('/down', function(ws, req) {
    ws.on('message', function(msg) {
        console.log(" --ws-- down : ", msg);
        try {
            const jMsg: any = JSON.parse(msg.toString());
            if (jMsg["command"] === "subscrbie") {
                reportManager.Subscribe(jMsg["key"]);
            }
            else if (jMsg["command"] === "unsubscrbie") {
                reportManager.Unsubscribe(jMsg["key"]);
            }
            else if (jMsg["command"] === "reset") {
                reportManager.Reset();
            }
        }
        catch {
            console.log(" --ws-- down unexpected message : ", msg);
        }
    });
    setInterval(() => {
        const updatedList: Array<any> = reportManager.GetUpdatedAll();
        console.log("updatedList = ", updatedList);
        updatedList.forEach(report => {
            ws.send(JSON.stringify({
                command: "report",
                report: report
            }));
        });
    }, 1000);
});

app.listen(PORT, () => {
    console.log(`Backend listening at http://localhost:${PORT}`);
});
