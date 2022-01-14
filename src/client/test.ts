

import { Account, Keypair, Connection, PublicKey, TokenAccountsFilter } from '@solana/web3.js';
import { Wallet } from "@project-serum/anchor";
import { Market, MARKETS } from '@project-serum/serum';

const PRIVATE_KEY: string = "";
const PUBLIC_KEY: string = "BXAj15Ze7Qs7kdPXDXTT5BeXP4RDL6UCeZHd79dBepfB";
const SPL_ACCOUNT: string = "7DsDREYh6G1UuVzb9YuJtF8kjztaMWE3BQe4srKPTVBv";

const WS_URL_REAL: string = "wss://api.serum-vial.dev/v1/ws";
const WS_URL_DEMO: string = "wss://api.serum-vial.dev/v1/ws";

const URL_CONNECTION_REAL: string = "https://solana-api.projectserum.com";
const URL_CONNECTION_DEMO: string = "https://testnet.solana.com";

const PROGRAM_ADDRESS_REAL: string = "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";
const PROGRAM_ADDRESS_DEMO: string = "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY";


// let privateKey: Keypair = Keypair.fromSecretKey(
//     new Uint8Array(JSON.parse(Buffer.from(PRIVATE_KEY).toString()))
// );
// let m_wallet: Wallet = new Wallet(privateKey);

// let m_owner: Account = new Account(new Uint8Array(JSON.parse(Buffer.from(PRIVATE_KEY).toString())));

let m_connection: Connection = new Connection(URL_CONNECTION_REAL);

m_connection.getParsedTokenAccountsByOwner(
    new PublicKey("BXAj15Ze7Qs7kdPXDXTT5BeXP4RDL6UCeZHd79dBepfB"), 
    {mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")}).then(rlt => {
    console.log(rlt.value, rlt.value.map(el => ({pubkey: el.pubkey.toBase58(), data: JSON.stringify(el.account.data)})));
}).catch(err => {
    console.log("error", err);
});


[
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // spl
    "BXAj15Ze7Qs7kdPXDXTT5BeXP4RDL6UCeZHd79dBepfB", // parent
    "7DsDREYh6G1UuVzb9YuJtF8kjztaMWE3BQe4srKPTVBv" // child
].forEach(address => {
    return;
    // m_connection.getBalanceAndContext(new PublicKey(address)).then(rlt => {
    //     console.log(address, rlt);
    // });
    [
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // spl
        "BXAj15Ze7Qs7kdPXDXTT5BeXP4RDL6UCeZHd79dBepfB", // parent
        "7DsDREYh6G1UuVzb9YuJtF8kjztaMWE3BQe4srKPTVBv" // child
    ].forEach(address2 => {
        m_connection.getParsedTokenAccountsByOwner(new PublicKey(address), {programId: new PublicKey(address2)}).then(rlt => {
            console.log(address, address2, rlt.value.map(el => el.pubkey.toBase58()));
        }).catch(err => {
            console.log("error", err);
        });
    });
    // m_connection.getParsedProgramAccounts(new PublicKey(address)).then(rlt => {
    //     console.log(address, rlt.map(el => ({owner: el.account.owner.toBase58(), pubkey: el.pubkey.toBase58()})));
    // }).catch(err =>{
    //     console.log("error", err);
    // });
    // m_connection.getProgramAccounts(new PublicKey(address)).then(rlt => {
    //     console.log(address, rlt.map(el => ({owner: el.account.owner.toBase58(), pubkey: el.pubkey.toBase58()})));
    // }).catch(err =>{
    //     console.log("error", err);
    // });
});
