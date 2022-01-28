import { Client, Exchange, Network, utils, types, Market, OraclePrice } from "@zetamarkets/sdk";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { Site } from './Site'
import { Symbol, ROrder, ORDER_KIND, ORDER_COMMAND } from "../Global";
import { UTimer } from "../Utils";

const PROGRAM_ID_REAL: string = "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD";
const PROGRAM_ID_DEMO: string = "BG3oRikW8d16YjUEmX3ZxHm9SiJzrGtMhsSR8aCw1Cd7";
const NET_URL_REAL: string = "https://solana-api.projectserum.com/";
const NET_URL_DEMO: string = "https://api.devnet.solana.com/";
const TICKSIZE: number = 100;

export class ZetaFutureSite extends Site {
  private m_wallet: Wallet | undefined;
  private m_client: Client | undefined;
  private m_bRealMode: Boolean = false;
  private m_timerOnTick: UTimer = new UTimer(1000);
  private m_marketPublicKey: PublicKey = PublicKey.default;
  m_zfSymbols: Map<string, ZFSymbol> = new Map<string, ZFSymbol>();
  m_nProcessCnt: number = 0;

  constructor() {
    super();
  }

  override async R_Init(): Promise<Boolean> {
    this.m_bRealMode = this.m_siteConfig.property.toLowerCase().includes("real");
    //this.m_bRealMode = true;

    return super.R_Init();
  }

  override async R_Login(): Promise<Boolean> {
    const connection = new Connection(this.m_bRealMode ? NET_URL_REAL : NET_URL_DEMO, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
    });

    const userKey = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(Buffer.from(this.m_siteConfig.password).toString()))
    );
    this.m_wallet = new Wallet(userKey);
    
    await Exchange.load(
      new PublicKey(this.m_bRealMode ? PROGRAM_ID_REAL : PROGRAM_ID_DEMO),
      this.m_bRealMode ? Network.MAINNET : Network.DEVNET,
      connection,
      utils.commitmentConfig("confirmed"),
      this.m_wallet,
      0
    );
    this.PutSiteLog("Exchange loaded");
  
    this.m_client = await Client.load(connection, this.m_wallet, utils.commitmentConfig("confirmed"), this.onClientEvent);
    
    let futureMarkets = Exchange.markets.markets.filter(x => (x.kind === types.Kind.FUTURE));
    let bSuccess = true;
    this.m_siteConfig.symbols.forEach(symbol => {
      const marketId: number = parseInt(symbol[1]);
      let market: Market | undefined = futureMarkets.find(_market => _market.marketIndex === marketId);
      if (market === undefined) bSuccess = false;
      else this.m_zfSymbols.set(symbol[0], new ZFSymbol(market, symbol[2]));
    });
    if (!bSuccess) return false;

    return super.R_Login();
  }

  override R_Logout(): void {
    super.R_Logout();
  }

  override R_OnTick(): Boolean {
    if (this.m_client && this.m_timerOnTick.Check()) {
      let client: Client = this.m_client;
      client.updateState();
      this.m_zfSymbols.forEach((zfSymbol, sSymbol) => {
        let marketIndex = zfSymbol.market.marketIndex;
        this.m_marketPublicKey = Exchange.markets.markets[marketIndex].address;
  
        if (!Exchange.markets.markets[marketIndex].expirySeries.isLive()) {
          console.log("it is not live");
          return;
        }
        zfSymbol.market.updateOrderbook();
        let asks = zfSymbol.market.orderbook.asks.sort((x, y) => (x.price - y.price));
        let bids = zfSymbol.market.orderbook.bids.sort((x, y) => (y.price - x.price));
        zfSymbol.setAsks(asks);
        zfSymbol.setBids(bids);

        let myBids: types.Order[] = client.orders.filter((order) => 
          (marketIndex === order.marketIndex && order.side === types.Side.BID)
        );
        zfSymbol.setMyBids(myBids);

        let myAsks: types.Order[] = client.orders.filter((order) => 
          (marketIndex === order.marketIndex && order.side === types.Side.ASK)
        );
        zfSymbol.setMyAsks(myAsks);

        let basePrice: OraclePrice = Exchange.oracle.getPrice(zfSymbol.sBaseSymbol);
        if (basePrice) zfSymbol.setTheoPrice(basePrice.price);
        
        super.OnRateUpdate(sSymbol, zfSymbol.ask(), zfSymbol.bid(), 1, 1);
      });
    }
    return super.R_OnTick();
  }

  override async R_UpdatePosInfo() {
    
    super.R_UpdatePosInfo();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    return true;
  }

  private onClientEvent = async (eventType: any, data: any) => {
    console.log("[event]" + eventType + " " + new Date().toISOString());
  }

  sendOrders = (lstOrderReq: Array<OrderReq>) => {
    this.m_nProcessCnt += lstOrderReq.length;
    Promise.all(lstOrderReq.map(async orderReq => {
      if (orderReq.type === "cancel") {
        await this.m_client?.cancelOrder(
          this.m_marketPublicKey,
          orderReq.order.orderId,
          orderReq.order.side
        ).then(rlt => {
          this.PutSiteLog("order response: " + rlt);
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        }).catch(err => {
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        });
      }
      else if (orderReq.type === "place") {
        await this.m_client?.placeOrder(
          this.m_marketPublicKey,
          Math.floor(utils.convertDecimalToNativeInteger(orderReq.price) / TICKSIZE) * TICKSIZE,
          utils.convertDecimalToNativeLotSize(orderReq.size),
          orderReq.side
        ).then(rlt => {
          this.PutSiteLog("order response: " + rlt);
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        }).catch(err => {
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        });
      }
      else if (orderReq.type === "cancelAndPlace") {
        await this.m_client?.cancelAndPlaceOrder(
          this.m_marketPublicKey,
          orderReq.order.orderId,
          orderReq.order.side,
          Math.floor(utils.convertDecimalToNativeInteger(orderReq.price) / TICKSIZE) * TICKSIZE,
          utils.convertDecimalToNativeLotSize(orderReq.size),
          orderReq.side
        ).then(rlt => {
          this.PutSiteLog("order response: " + rlt);
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        }).catch(err => {
          if (this.m_nProcessCnt > 0) this.m_nProcessCnt--;
        });
      }
    }));
  }
}

export class ZFSymbol {
  market: Market;
  sBaseSymbol: string;
  asks: Array<types.Level> = [];
  bids: Array<types.Level> = [];
  myAsks: Array<types.Order> = [];
  myBids: Array<types.Order> = [];
  theoPrice: number = 0;
  expireTS: number;

  constructor(market: Market, sBaseSymbol: string) {
    this.market = market;
    this.sBaseSymbol = sBaseSymbol;
    this.expireTS = market.expirySeries.expiryTs;
  }

  setTheoPrice(theoPrice: number) {
    this.theoPrice = theoPrice;
  }

  setAsks(asks: types.Level[]): void {
    this.asks = asks;
  }

  setBids(bids: types.Level[]): void {
    this.bids = bids;
  }

  setMyAsks(myAsks: types.Order[]): void {
    this.myAsks = myAsks;
  }

  setMyBids(myBids: types.Order[]): void {
    this.myBids = myBids;
  }

  ask(): number {
    return this.asks.length > 0 ? this.asks[0].price : 0;
  }

  bid(): number {
    return this.bids.length > 0 ? this.bids[0].price : 0;
  }
}

export interface OrderReq {
  type: "cancel" | "place" | "cancelAndPlace",
  order: types.Order,
  price: number;
  size: number;
  side: types.Side;
}
