import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../constants';

type Props = {
    clients: Array<string>
};

type LogicType = {
    key: string,
    data: any
};

export const LogicList = ({ clients }: Props) => {
    const [logics, setLogics] = useState<Array<LogicType>>([]);

    useEffect(() => {
        axios.post(BACKEND_URL + "/down", {
            keys: clients.map(client => client + "$logic$")
        }).then(function(rsp) {
            let _logics: Array<LogicType> = rsp.data.data;
            setLogics(_logics);
        }).catch(function (err) {
            console.log(err);
        });
    }, []);
    console.log(logics)
    
    return (
        <div>
            <table>
                <tr>
                    <td>LogicID</td>
                </tr>
                {logics && logics.map(logic => (
                    <tr>
                        <td>{logic.key.split('$')[2]}</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}
