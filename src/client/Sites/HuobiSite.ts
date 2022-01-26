import { Site } from './Site'
import { Symbol, ROrder, ORDER_KIND, ORDER_COMMAND } from "../Global";
import { UWebsocket } from '../Utils';
import { HuobiRestAPI } from 'huobi-api';

const WS_URL_BASE: string = "wss://api.huobi.pro/ws";
const WS_URL_ACCOUNT: string = "wss://api.huobi.pro/ws/v2";

const URL_POS_LIST: string = "/v1/order/openOrders";
const URL_NEW_ORDER: string = "/v1/order/orders/place";
const URL_ACC_LIST: string = "/v1/account/accounts";
const URL_ACC_INFO: string = "/v1/account/accounts/{account-id}/balance";

export class HuobiSite extends Site {
  m_websocketRate: UWebsocket;
  m_websocketAccount: UWebsocket;
  m_huobiRestAPI: HuobiRestAPI | undefined = undefined;
  m_accountID: string = "";

  constructor() {
    super();
    this.m_websocketRate = new UWebsocket(
      WS_URL_BASE,
      null, 
      this.onWSReceive, 
      this.onWSError 
      );
    this.m_websocketAccount = new UWebsocket(
      WS_URL_ACCOUNT,
      null, 
      this.onWSReceiveAcc, 
      this.onWSError 
      );
  }

  override R_Init(): Boolean {
    return super.R_Init();
  }

  override R_Login(): Boolean {
    this.m_websocketRate.Open();
    this.m_symbols.forEach(symbol => {
      this.m_websocketRate.SendJson({
        "sub": "market." + symbol.m_sSymbolName + ".ticker"
      });
    });
    this.m_websocketAccount.Open();
    this.m_symbols.forEach(symbol => {
      this.m_websocketAccount.SendJson({
        "action": "sub",
        "ch": "orders#" + symbol.m_sSymbolName
      });
    });
    this.m_huobiRestAPI = new HuobiRestAPI({
      accessKey: this.m_siteConfig.username,
      secretKey: this.m_siteConfig.password
    });
    this.m_huobiRestAPI.get(URL_ACC_LIST).then((res: any) => {
      if (res["status"] === "ok") {
        let accounts: Array<any> = res["data"];
        accounts.forEach(account => {
          if (account["type"] === "spot") this.m_accountID = account["id"];
        });
        this.PutSiteLog("accounts = " + JSON.stringify(accounts));
      }
    });

    return super.R_Login();
  }

  override R_Logout(): void {
    this.m_websocketRate.Close();
    this.m_websocketAccount.Close();
    super.R_Logout();
  }

  override R_OnTick(): Boolean {
    return super.R_OnTick();
  }

  override async R_UpdatePosInfo() {
    let res = await this.m_huobiRestAPI?.get(URL_ACC_INFO.replace("{account-id}", this.m_accountID));
    if (res["status"] === "ok") {
      let balances: Array<any> = (res["data"]["list"]);
      balances = balances.filter(balance => balance["balance"] > 0);
      let balanceUSD = 0;
      let marginUSD = 0;
      balances.forEach(balance => {
        if (balance["currency"] === "usdt" || balance["currency"] === "usdc") {
          balanceUSD += balance["balance"];
        }
      });
      this.m_accountInfo.m_dBalance = balanceUSD;
      this.m_accountInfo.m_dMargin = marginUSD;
      this.m_accountInfo.m_subBalances = balances;
    }
    super.R_UpdatePosInfo();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    let sType: string = "";
    if (rOrder.m_eCmd === ORDER_COMMAND.Buy || rOrder.m_eCmd === ORDER_COMMAND.SellClose) sType = "buy-";
    else sType = "sell-";
    if (rOrder.m_eKind === ORDER_KIND.Limit) sType += "limit";
    else if (rOrder.m_eKind === ORDER_KIND.Market) sType += "market";
    let params: any = {
      "symbol": rOrder.m_symbol.m_sSymbolName,
      "type": sType,
      "amount": rOrder.m_dSigLots,
      "price": rOrder.m_dSigPrice,
      "account-id": this.m_accountID
    };
    this.PutSiteLog("OrderSend" + JSON.stringify(params));
    this.m_huobiRestAPI?.post(URL_NEW_ORDER, params).then(res => {
      this.PutSiteLog("Order Response: " + JSON.stringify(res));
      if (res["status"] === "ok") {
        let sOrderID: string = res["data"];
      }
      else {
        this.OnOrderFinished(rOrder.m_symbol.m_sSymbolName);
      }
    });
    return true;
  }

  onWSReceive: ((jMsg: any) => void) = (jMsg: any) => {
    try {
      if ("ping" in jMsg) {
        this.m_websocketRate.SendJson({
          pong: jMsg["ping"]
        });
        return;
      }
      const ch: string = jMsg["ch"].toString();
      const chWords: string[] = ch.split('.');
      if (chWords.length === 3 && chWords[0] === "market" && chWords[2] === "ticker") {
        const sSymbol: string = chWords[1];
        const jTick: any = jMsg["tick"];
        if (jTick) {
          const dAsk: number = jTick["ask"];
          const dBid: number = jTick["bid"];
          const dAskSize: number = jTick["askSize"];
          const dBidSize: number = jTick["bidSize"];
          super.OnRateUpdate(sSymbol, dAsk, dBid, dAskSize, dBidSize);
        }
      }
    }
    catch {}
  }

  onWSReceiveAcc: ((jMsg: any) => void) = (jMsg: any) => {
    try {
      if (jMsg["action"] === "ping") {
        jMsg["action"] = "pong";
        this.m_websocketAccount.SendJson(jMsg);
        return;
      }
      // TODO:
      console.log(jMsg);
    }
    catch {}
  }

  onWSError: ((sError: string) => void) = (sError: string) => {
    super.PutSiteLog("Huobi error : " + sError);
  }
}
