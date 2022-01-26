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

const MANUAL_ORDER_TYPES: Array<string> = [
  "Market",
  "Limit",
  "TWAP"
];

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
  }, [paramModalOpen]);

  const setParams = () => {
    console.log("paramCache = ", paramCache);
    if (Object.keys(paramCache).length > 0) {
      axios.post(BACKEND_URL + "/set_param", {
        logic_key: activeLogic?.key,
        data: paramCache
      }).then(function(rsp) {

      }).catch(function(err) {
        console.log(err);
      });
    }
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

  const onSubmitOrder = (event: any) => {
    axios.post(BACKEND_URL + "/set_order", {
      logic_key: activeLogic?.key,
      data: {
        product: event.target.product.value,
        cmd: event.target.cmd.value,
        lots: event.target.lots.value,
        price: event.target.price.value,
        type: event.target.type.value
      }
    }).then(function(rsp) {

    }).catch(function(err) {
      console.log(err);
    });
    setOrderModalOpen(false);
  }
  
  return (
    <div>
      <table>
        <tr>
          <td>Client</td>
          <td>LogicID</td>
          <td>LogicType</td>
          <td></td>
        </tr>
        {logics && logics.map(logic => (
          <tr key={logic.key}>
            <td>{logic.key.split('$')[0]}</td>
            <td>{logic.key.split('$')[2]}</td>
            <td>{logic.data.logic_type}</td>
            <td>
              <button onClick={() => {
                setActiveLogic({...logic});
                setOrderModalOpen(true);
              }}>Manual Order</button>
              <button onClick={() => {
                setActiveLogic({...logic});
                setParamModalOpen(true);
              }}>Parameters</button>
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
              <tr key={sName}>
                <td>{sName}</td>
                <td><input type="text" value={activeLogic.data.params[sName]} onChange={(event) => onParamChange(event, sName)}/></td>
              </tr>
            )})}
          </table>
          <button onClick={setParams}>Update</button>
          <button onClick={onCloseParamModal}>Cancel</button>
        </div>
      </Modal>
      <Modal
        isOpen={orderModalOpen}
        onRequestClose={() => setOrderModalOpen(false)}
        style={styles.modalBox}
      >
        <form onSubmit={onSubmitOrder}>
          <label>Symbol : </label>
          <select name="product">
            {activeLogic?.data.products.map((product, id) => (
              <option value={`${product[0]}_${product[1]}`} key={id} selected={id===0}>
                {`${product[0]}_${product[1]}`}
              </option>
            ))}
          </select>
          <br />
          <label>Lots : </label>
          <input name="lots" type="number" step="0.00001" defaultValue={"0"} />
          <br />
          <label>Price : </label>
          <input name="price" type="number" step="0.00000000001" defaultValue={"0"} />
          <br />
          <label>Buy/Sell : </label>
          <select name="cmd">
            <option value={"Buy"} selected>{"Buy"}</option>
            <option value={"Sell"}>{"Sell"}</option>
          </select>
          <br />
          <label>Type : </label>
          <select name="type">
            {MANUAL_ORDER_TYPES.map((tp, id) => (
              <option value={tp} key={id} selected={id===0}>
                {tp}
              </option>
            ))}
          </select>
          <br />
          <br />
          <input type="submit" value="Submit" />
          <button onClick={() => setOrderModalOpen(false)}>Cancel</button>
        </form>
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
