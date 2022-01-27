import { Client, Exchange, Network, utils, types } from "@zetamarkets/sdk";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { Site } from './Site'
import { Symbol, ROrder, ORDER_KIND, ORDER_COMMAND } from "../Global";

const PROGRAM_ID_REAL: string = "ZETAxsqBRek56DhiGXrn75yj2NHU3aYUnxvHXpkf3aD";
const PROGRAM_ID_DEMO: string = "BG3oRikW8d16YjUEmX3ZxHm9SiJzrGtMhsSR8aCw1Cd7";
const NET_URL_REAL: string = "https://solana-api.projectserum.com/";
const NET_URL_DEMO: string = "https://api.devnet.solana.com/";

export class ZetaFutureSite extends Site {
  private m_wallet: Wallet | undefined;
  private m_client: Client | undefined;
  private m_bRealMode: Boolean = false;

  constructor() {
    super();
  }

  override async R_Init(): Promise<Boolean> {
    this.m_bRealMode = this.m_siteConfig.property.toLowerCase().includes("real");
    const connection = new Connection(this.m_bRealMode ? NET_URL_REAL : NET_URL_DEMO, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
    });

    const userKey = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(Buffer.from(process.env.PRIVATE_KEY!).toString()))
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
    //this.PutSiteLog("Exchange loaded");
  
    //this.client = await Client.load(connection, this.m_wallet, utils.commitmentConfig("confirmed"), this.onClientEvent);
    return super.R_Init();
  }

  override R_Login(): Boolean {

    return super.R_Login();
  }

  override R_Logout(): void {
    super.R_Logout();
  }

  override R_OnTick(): Boolean {
    return super.R_OnTick();
  }

  override async R_UpdatePosInfo() {
    
    super.R_UpdatePosInfo();
  }

  override R_OrderSend(rOrder: ROrder): Boolean {
    if (!super.R_OrderSend(rOrder)) return false;
    
    return true;
  }
}
