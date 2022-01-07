import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

type Props = {
    clients: Array<string>
};

type AccountType = {
    key: string,
    data: {
        accountInfo: any | undefined,
        site: string | undefined
    }
};

export const AccountList = ({ clients }: Props) => {
    const [accounts, setAccounts] = useState<Array<AccountType>>([]);

    useEffect(() => {
        axios.post(BACKEND_URL + "/down", {
            keys: clients.map(client => client + "$account$")
        }).then(function(rsp) {
            let _accounts: Array<AccountType> = rsp.data.data;
            setAccounts(_accounts);
        }).catch(function (err) {
            console.log(err);
        });
    }, []);
    
    return (
        <div>
            <table>
                <tr>
                    <td>AccountID</td>
                    <td>Balance</td>
                    <td>Equity</td>
                    <td>Margin</td>
                    <td>SubBalances</td>
                </tr>
                {accounts && accounts.map(account => (
                    <tr>
                        <td>{account.key.split('$')[2]}</td>
                        <td>{account.data.accountInfo.m_dBalance | 0}</td>
                        <td>{account.data.accountInfo.m_dEquity | 0}</td>
                        <td>{account.data.accountInfo.m_dMargin | 0}</td>
                        <td>{JSON.stringify(account.data.accountInfo.m_subBalances)}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}
