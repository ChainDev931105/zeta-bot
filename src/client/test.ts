

import { Account, Keypair, Connection, PublicKey, TokenAccountsFilter } from '@solana/web3.js';
import { Wallet } from "@project-serum/anchor";
import { Market, MARKETS } from '@project-serum/serum';

const PRIVATE_KEY: string = "";
const PUBLIC_KEY: string = "BXAj15Ze7Qs7kdPXDXTT5BeXP4RDL6UCeZHd79dBepfB";
const SPL_ACCOUNT: string = "7DsDREYh6G1UuVzb9YuJtF8kjztaMWE3BQe4srKPTVBv";

const WS_URL_REAL: string = "wss://api.serum-vial.dev/v1/ws";
const WS_URL_DEMO: string = "wss://api.serum-vial.dev/v1/ws";

const URL_CONNECTION_REAL: string = "https://solana-api.projectserum.com";
const URL_CONNECTION_DEMO: string = "https://api.devnet.solana.com";

const PROGRAM_ADDRESS_REAL: string = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const PROGRAM_ADDRESS_DEMO: string = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";


// let privateKey: Keypair = Keypair.fromSecretKey(
//     new Uint8Array(JSON.parse(Buffer.from(PRIVATE_KEY).toString()))
// );
// let m_wallet: Wallet = new Wallet(privateKey);

// let m_owner: Account = new Account(new Uint8Array(JSON.parse(Buffer.from(PRIVATE_KEY).toString())));

// MARKETS.forEach(market => {
//     console.log(market.address.toBase58(), market.programId.toBase58(), market.name);
// });
if (false) { // real
    let m_connection: Connection = new Connection(URL_CONNECTION_REAL);
    let marketAddress: PublicKey = new PublicKey("A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw");
    let programId: PublicKey = new PublicKey(PROGRAM_ADDRESS_REAL);
    
    m_connection.getAccountInfo(marketAddress).then(rlt => {
        console.log("pre result = ", rlt, rlt?.owner.toBase58());
    });
    
    Market.load(m_connection, marketAddress, {}, programId).then(rlt => {
        console.log("result = ", rlt);
    }).catch(err => {
        console.log("err", err);
    });
    
    m_connection.getParsedTokenAccountsByOwner(
        new PublicKey("FxwTkPfkcb1gxgZAtLUqM92CBhNGDhMTJ8jksLUwMRa1"), 
        {mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")}).then(rlt => {
        console.log(rlt.value, rlt.value.map(el => ({pubkey: el.pubkey.toBase58(), data: JSON.stringify(el.account.data)})));
    }).catch(err => {
        console.log("error", err);
    });
}
else {
    let m_connection: Connection = new Connection(URL_CONNECTION_DEMO);
    let marketAddress: PublicKey = new PublicKey("HCGGqktRV1UXFKHoqEkdf9HqXs6Rfp7xSdwLcvHUy8KD"); // mango testnet BTC/USDC
    let programId: PublicKey = new PublicKey(PROGRAM_ADDRESS_DEMO);
    
    m_connection.getAccountInfo(marketAddress).then(rlt => {
        console.log("pre result = ", rlt, rlt?.owner.toBase58());
    });
    
    Market.load(m_connection, marketAddress, {}, programId).then(rlt => {
        console.log("result = ", 
        rlt.programId.toBase58(),       // DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY
        rlt.publicKey.toBase58(),       // 8H7c3jxFG8gi2YBhSqBxxE8ySYHkXW1M5jUokJYQWqhj
        rlt.quoteMintAddress.toBase58(),// 8FRFC6MoGGkMFQwngccyu69VnYbzykGeez7ignHVAFSN --- devnet USDC
        rlt.baseMintAddress.toBase58(), // 3UNBZ6o52WTWwjac2kPUb4FyodhU1vFkRJheu1Sh2TvU --- devnet BTC
        rlt.address.toBase58());        // 8H7c3jxFG8gi2YBhSqBxxE8ySYHkXW1M5jUokJYQWqhj
    }).catch(err => {
        console.log("err", err);
    });
    
    // m_connection.getParsedTokenAccountsByOwner(
    //     new PublicKey("FxwTkPfkcb1gxgZAtLUqM92CBhNGDhMTJ8jksLUwMRa1"), 
    //     {mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")}).then(rlt => {
    //     console.log(rlt.value, rlt.value.map(el => ({pubkey: el.pubkey.toBase58(), data: JSON.stringify(el.account.data)})));
    // }).catch(err => {
    //     console.log("error", err);
    // });
}
