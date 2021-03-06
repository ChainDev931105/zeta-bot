import { Account, Keypair, Connection, PublicKey } from '@solana/web3.js';
import { Wallet } from "@project-serum/anchor";
import { Market, MARKETS } from '@project-serum/serum';
import BN from 'bn.js';
import { PartOrder, Site } from './Site'
import { UWebsocket } from '../Utils';
import { Symbol, ORDER_COMMAND, ORDER_KIND, ROrder } from '../Global';

const WS_URL_REAL: string = "wss://api.serum-vial.dev/v1/ws";
const WS_URL_DEMO: string = "wss://api.serum-vial.dev/v1/ws";// TODO: find URL for demo

const URL_CONNECTION_REAL: string = "https://solana-api.projectserum.com";
const URL_CONNECTION_DEMO: string = "https://api.devnet.solana.com";

const PROGRAM_ADDRESS_REAL: string = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const PROGRAM_ADDRESS_DEMO: string = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";

const SPL_PROGRAM_ID: string = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const SOL_TOKEN : string = "So11111111111111111111111111111111111111112";

export class SerumSite extends Site {
  m_websocket: UWebsocket | undefined;
  m_wallet: Wallet | undefined;
  m_owner: Account | undefined;
  m_markets: Map<string, Market> = new Map<string, Market>(); // BTC/USDC
  m_baseTokenAccounts: Map<string, PublicKey> = new Map<string, PublicKey>(); // BTC
  m_quoteTokenAccounts: Map<string, PublicKey> = new Map<string, PublicKey>(); // USDC
  m_connection: Connection | undefined;
  m_orderIDs: Map<string, Boolean> = new Map<string, Boolean>();
  m_bLockAcc: Boolean = false;

  constructor() {
    super();
  }

  override async R_Init(): Promise<Boolean> {
    this.m_websocket = new UWebsocket(
      this.isReal() ? WS_URL_REAL : WS_URL_DEMO,
      null,
      this.onWSReceive,
      this.onWSError
    );
    
    return super.R_Init();
  }

  override async R_Login(): Promise<Boolean> {
    let privateKey: Keypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(Buffer.from(this.m_siteConfig.password).toString()))
    );
    this.m_wallet = new Wallet(privateKey);

    this.m_owner = new Account(
      new Uint8Array(JSON.parse(Buffer.from(this.m_siteConfig.password).toString())));
    if (this.m_siteConfig.username !== this.m_wallet.publicKey.toBase58()) {
      this.PutSiteLog("Public Key is not matched " + this.m_wallet.publicKey.toBase58());
      return false;
    }
    this.PutSiteLog("login step 1");

    if (this.m_websocket && this.m_siteConfig.symbols.length > 0) {
      this.m_websocket.Open();
      this.m_websocket.SendJson({
        op: 'subscribe',
        channel: 'level1', // "level3" | "level2" | "level1" | "trades"
        markets: this.m_siteConfig.symbols.map(symbol => symbol[0])
      });
    }
    this.PutSiteLog("login step 2");

    this.m_connection = new Connection(this.isReal() ? URL_CONNECTION_REAL : URL_CONNECTION_DEMO);
    let programId: PublicKey = new PublicKey(this.isReal() ? PROGRAM_ADDRESS_REAL : PROGRAM_ADDRESS_DEMO);

    this.PutSiteLog("login step 3 " + programId);

    let bRlt: Boolean = true;
    this.m_symbols.forEach(symbol => {
      let marketAddress: PublicKey | undefined = this.getMarketAddress(symbol);
      if (marketAddress === undefined) {
        bRlt = false;
        return;
      }

      this.m_connection && Market.load(this.m_connection, marketAddress, {}, programId).then(market => {
        this.m_markets.set(symbol.m_sSymbolName, market);
        this.PutSiteLog(symbol.m_sSymbolName + " has valid market");

        if (symbol.m_lstDetailInfo[1] === SOL_TOKEN) {
          this.m_wallet && this.m_baseTokenAccounts.set(symbol.m_sSymbolName, this.m_wallet.publicKey);
          this.PutSiteLog(symbol.m_sSymbolName + " has valid base token account");
        }
        else {
          this.m_wallet && this.m_connection && this.m_connection.getParsedTokenAccountsByOwner(
            this.m_wallet.publicKey,
            { mint: new PublicKey(symbol.m_lstDetailInfo[1]) }
          ).then(accounts => {
            if (accounts.value.length < 1) bRlt = false;
            else {
              this.PutSiteLog(accounts.value.map(el => ({pubkey: el.pubkey.toBase58(), data: JSON.stringify(el.account.data)})).toString());
              this.m_baseTokenAccounts.set(symbol.m_sSymbolName, accounts.value[0].pubkey);
              this.PutSiteLog(symbol.m_sSymbolName + " has valid base token account");
            }
          }).catch(err => {
            this.PutSiteLog("err2 " + err);
            bRlt = false;
          });
        }

        if (symbol.m_lstDetailInfo[2] === SOL_TOKEN) {
          this.m_wallet && this.m_quoteTokenAccounts.set(symbol.m_sSymbolName, this.m_wallet.publicKey);
          this.PutSiteLog(symbol.m_sSymbolName + " has valid quote token account");
        }
        else {
          this.m_wallet && this.m_connection && this.m_connection.getParsedTokenAccountsByOwner(
            this.m_wallet.publicKey,
            { mint: new PublicKey(symbol.m_lstDetailInfo[2]) }
          ).then(accounts => {
            if (accounts.value.length < 1) bRlt = false;
            else {
              this.PutSiteLog(accounts.value.map(el => ({pubkey: el.pubkey.toBase58(), data: JSON.stringify(el.account.data)})).toString());
              this.m_quoteTokenAccounts.set(symbol.m_sSymbolName, accounts.value[0].pubkey);
              this.PutSiteLog(symbol.m_sSymbolName + " has valid quote token account");
            }
          }).catch(err => {
            this.PutSiteLog("err3 " + err);
            bRlt = false;
          });
        }
      }).catch(err => {
        this.PutSiteLog("err1 " + err);
        bRlt = false;
      });
    });
    if (!bRlt) return false;

    return super.R_Login();
  }

  override R_Logout(): void {
    this.m_websocket?.Close();
    super.R_Logout();
  }

  override R_OnTick(): Boolean {
    return super.R_OnTick();
  }

  override async R_UpdatePosInfo() {
    if (!this.m_wallet || !this.m_connection || !this.m_owner) return;
    if (this.m_bLockAcc) return;
    this.m_bLockAcc = true;
    try {
      let solBalance: number = await this.m_connection.getBalance(this.m_wallet.publicKey) / 1e9;
      let balances = await this.m_connection.getParsedTokenAccountsByOwner(
        this.m_wallet.publicKey, 
        {programId: new PublicKey(SPL_PROGRAM_ID)}
      );
      
      let subBalances: Array<any> = balances.value.map(balance => ({
        token: balance.account.data.parsed.info.mint,
        balance: balance.account.data.parsed.info.tokenAmount.uiAmount
      }));
      subBalances.push({
        token: "SOL",
        balance: solBalance
      });
      this.m_accountInfo.m_dBalance = solBalance;
      this.m_accountInfo.m_subBalances = subBalances;
      await this.m_markets.forEach(async (market, sSymbol) => {
        let baseTokenAccount_ = this.m_baseTokenAccounts.get(sSymbol);
        let quoteTokenAccount_ = this.m_quoteTokenAccounts.get(sSymbol);
        if (!this.m_wallet || !this.m_connection || !this.m_owner || !baseTokenAccount_ || !quoteTokenAccount_) return;
        let baseTokenAccount = baseTokenAccount_;
        let quoteTokenAccount = quoteTokenAccount_;
        let lstOpenOrders = await market.findOpenOrdersAccountsForOwner(this.m_connection, this.m_owner.publicKey);

        lstOpenOrders.forEach(async openOrders => {
          if (openOrders.baseTokenFree > new BN(0) || openOrders.quoteTokenFree > new BN(0)) {
            if (!this.m_connection || !this.m_owner) return;
            let dLots: number = openOrders.baseTokenFree.toNumber() + openOrders.quoteTokenFree.toNumber();
            this.PutSiteLog("settleFunds" + sSymbol + " " + dLots);
            let result = await market.settleFunds(
              this.m_connection,
              this.m_owner,
              openOrders,
              baseTokenAccount,
              quoteTokenAccount,
            );
            this.PutSiteLog("settleFunds result = " + result);
            let partOrder: PartOrder | undefined = this.m_partOrders.get(sSymbol);
            if (partOrder) {
              this.OnOrderUpdate(sSymbol, partOrder.dSignalLots, 0);
            }
          }
        });
      });
    }
    catch(err) {
      this.PutSiteLog("R_UpdatePosInfo error: " + err);
    }
    this.m_bLockAcc = false;
    super.R_UpdatePosInfo();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    let market: Market | undefined = this.m_markets.get(rOrder.m_symbol.m_sSymbolName);
    let quoteTokenAccount: PublicKey | undefined = this.m_quoteTokenAccounts.get(rOrder.m_symbol.m_sSymbolName);
    let baseTokenAccount: PublicKey | undefined = this.m_baseTokenAccounts.get(rOrder.m_symbol.m_sSymbolName);

    if (!this.m_owner || !this.m_connection || !market || !quoteTokenAccount || !baseTokenAccount) {
      this.PutSiteLog("undefined object");
      return false;
    }

    let side: 'buy' | 'sell' = (rOrder.m_eCmd === ORDER_COMMAND.Buy || rOrder.m_eCmd === ORDER_COMMAND.SellClose) ? 'buy' : 'sell';
    let payer: PublicKey = (side === 'sell') ? baseTokenAccount : quoteTokenAccount;
    
    market.placeOrder(this.m_connection, {
      owner: this.m_owner,
      payer,
      side, // 'buy' or 'sell'
      price: rOrder.m_dSigPrice,
      size: rOrder.m_dSigLots,
      orderType: rOrder.m_eKind === ORDER_KIND.Limit ? 'limit' : 'ioc', // 'limit', 'ioc', 'postOnly'
      feeDiscountPubkey: null
    }).then(rlt => {
      this.PutSiteLog("Order Response: " + JSON.stringify(rlt));
    });
    return true;
  }

  private isReal() {
    return this.m_siteConfig.property.toLowerCase().includes("real");
  }

  private getMarketAddress(symbol: Symbol): PublicKey | undefined {
    if (symbol.m_lstDetailInfo.length < 1) return undefined;
    return new PublicKey(symbol.m_lstDetailInfo[0]);
  }

  onWSReceive: ((jMsg: any) => void) = (jMsg: any) => {
    try {
      if (jMsg["type"] === "quote") {
        let sSymbol: string = jMsg["market"];
        let dAsk: number = parseFloat(jMsg["bestAsk"][0]);
        let dBid: number = parseFloat(jMsg["bestBid"][0]);
        let dAskSize: number = parseFloat(jMsg["bestAsk"][1]);
        let dBidSize: number = parseFloat(jMsg["bestBid"][1]);
        super.OnRateUpdate(sSymbol, dAsk, dBid, dAskSize, dBidSize);
      }
    }
    catch {}
  }

  onWSError: ((sError: string) => void) = (sError: string) => {
    super.PutSiteLog("Serum error : " + sError);
  }
}
