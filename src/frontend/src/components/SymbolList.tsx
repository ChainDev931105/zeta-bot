import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

type Props = {
    clients: Array<string>
};

type SymbolReport = {
    key: string,
    data: any
};

export const SymbolList = ({ clients }: Props) => {
    const [symbols, setSymbols] = useState<Array<SymbolReport>>([]);

    useEffect(() => {
        axios.post(BACKEND_URL + "/down", {
            keys: clients.map(client => client + "$symbol$")
        }).then(function(rsp) {
            let _symbols: Array<SymbolReport> = rsp.data.data;
            setSymbols(_symbols);
        }).catch(function (err) {
            console.log(err);
        });
    }, []);
    console.log(symbols)
    
    return (
        <div>
            <table>
                <tr>
                    <td>SymbolID</td>
                    <td>Ask</td>
                    <td>Bid</td>
                    <td>AskVolume</td>
                    <td>BidVolume</td>
                </tr>
                {symbols && symbols.map(symbol => (
                    <tr>
                        <td>{symbol.key.split('$')[2]}</td>
                        <td>{symbol.data.rate.ask}</td>
                        <td>{symbol.data.rate.bid}</td>
                        <td>{symbol.data.rate.askVolume}</td>
                        <td>{symbol.data.rate.bidVolume}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}
