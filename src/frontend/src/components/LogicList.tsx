import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { BACKEND_URL } from '../constants';

type Props = {
    clients: Array<string>
};

type LogicReport = {
    key: string,
    data: {
        params: any,
        products: Array<Array<string>>,
        logic_type: string
    }
};

export const LogicList = ({ clients }: Props) => {
    const [logics, setLogics] = useState<Array<LogicReport>>([]);
    const [paramModalOpen, setParamModalOpen] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [activeLogic, setActiveLogic] = useState<LogicReport | null>(null);
    const [paramCache, setParamCache] = useState<any>({});

    useEffect(() => {
        axios.post(BACKEND_URL + "/down", {
            keys: clients.map(client => client + "$logic$")
        }).then(function(rsp) {
            let _logics: Array<LogicReport> = rsp.data.data;
            setLogics(_logics);
        }).catch(function (err) {
            console.log(err);
        });
    }, []);

    const setParams = () => {
        console.log("paramCache = ", paramCache);
        axios.post(BACKEND_URL + "/set_param", {
            logic_key: activeLogic?.key,
            data: paramCache
        }).then(function(rsp) {

        }).catch(function(err) {
            console.log(err);
        });
        setParamModalOpen(false);
    }

    const onParamChange = (event: any, sName: string) => {
        if (activeLogic) {
            let _activeLogic: LogicReport = {...activeLogic};
            _activeLogic.data = {..._activeLogic.data};
            _activeLogic.data.params = {..._activeLogic.data.params};
            _activeLogic.data.params[sName] = event.target.value;
            setActiveLogic(_activeLogic);
        }
        let _paramCache: any = {...paramCache};
        _paramCache[sName] = event.target.value;
        setParamCache(_paramCache);
    }

    const onCloseParamModal = () => {
        setParamCache({});
        setParamModalOpen(false);
    }
    
    return (
        <div>
            <table>
                <tr>
                    <td>LogicID</td>
                    <td>LogicType</td>
                    <td></td>
                </tr>
                {logics && logics.map(logic => (
                    <tr>
                        <td>{logic.key.split('$')[2]}</td>
                        <td></td>
                        <td>
                            <button onClick={() => {
                                setActiveLogic({...logic});
                                setOrderModalOpen(true);
                                console.log(activeLogic, Object.keys(activeLogic?.data.params));
                            }}>Manual Order</button>
                            <button onClick={() => {
                                setActiveLogic({...logic});
                                setParamModalOpen(true);
                                console.log(activeLogic, Object.keys(activeLogic?.data.params));
                            }}>Set Parameter</button>
                        </td>
                    </tr>
                ))}
            </table>
            <Modal
                isOpen={paramModalOpen}
                onRequestClose={onCloseParamModal}
                style={styles.modalBox}
            >
                <div>
                    <table>
                        <tr>
                            <td>Name</td>
                            <td>Value</td>
                        </tr>
                        {(activeLogic !== null) && Object.keys(activeLogic.data.params).map(sName => {
                            return (
                            <tr>
                                <td>{sName}</td>
                                <td><input type="text" value={activeLogic.data.params[sName]} onChange={(event) => onParamChange(event, sName)}/></td>
                            </tr>
                        )})}
                    </table>
                    <button onClick={setParams}>OK</button>
                    <button onClick={onCloseParamModal}>Cancel</button>
                </div>
            </Modal>
            <Modal
                isOpen={orderModalOpen}
                onRequestClose={() => setOrderModalOpen(false)}
                style={styles.modalBox}
            >
                <div>
                    Hello
                </div>
            </Modal>
        </div>
    )
}

const styles = {
    modalBox: {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)'
        },
        overlay: {
            flex: 1
        }
    }
}
