import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

type Props = {
    clients: Array<string>
};

type SymbolType = {
    key: string,
    data: any
};

export const SymbolList = ({ clients }: Props) => {
    const [symbols, setSymbols] = useState<Array<SymbolType>>([]);

    useEffect(() => {
        axios.post(BACKEND_URL + "/down", {
            keys: clients.map(client => client + "$symbol$")
        }).then(function(rsp) {
            let _symbols: Array<SymbolType> = rsp.data.data;
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
                </tr>
                {symbols && symbols.map(symbol => (
                    <tr>
                        <td>{symbol.key.split('$')[2]}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}
