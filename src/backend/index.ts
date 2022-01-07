import express from 'express'
import cors from 'cors';
import expressWs from 'express-ws';
import { LogicConfig, SiteConfig } from '../common/config';
import { ConfigManager } from './ConfigManager';
import { ReportManager } from './ReportManager';

require('dotenv').config()

const PORT = process.env.BACKEND_PORT;
const app = expressWs(express()).app;
const reportManager: ReportManager = new ReportManager();

ConfigManager.Load();

app.use(express.json());

app.use(cors());

app.get("/config", function (req: any, res: any) {
    let sClientName: string = req.query["client"];
    let { lstLogicConfig, lstSiteConfig }: { lstLogicConfig: Array<LogicConfig>, lstSiteConfig: Array<SiteConfig> } = 
        ConfigManager.GenerateConfigs(sClientName);
    res.json({
        success: true,
        data: {
            sites: lstSiteConfig,
            logics: lstLogicConfig
        }
    });
});

app.get("/clients", function (req: any, res: any) {
    let clients: Array<string> = ConfigManager.GetClients();
    res.json({
        success: true,
        data: clients
    });
});

app.post("/down", function (req: any, res: any) {
    let reqBody: any = req.body;
    console.log({ reqBody });
    let keys: Array<string> = reqBody["keys"];
    let reports: Array<any> = reportManager.GetReports(keys);
    res.json({
        success: true,
        data: reports
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
