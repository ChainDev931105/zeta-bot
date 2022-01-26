import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SystemList } from './SystemList';
import { LogicList } from './LogicList';
import { SymbolList } from './SymbolList';
import { AccountList } from './AccountList';
import { BACKEND_URL } from '../constants';

const PAGES: Array<string> = [
  "system",
  "logic",
  "symbol",
  "account"
];

export const MainView = () => {
  const [activePage, setActivepage] = useState(PAGES[0]);
  const [clients, setClients] = useState<any>([]);

  useEffect(() => {
    axios.get(BACKEND_URL + "/clients").then(function(rsp) {
      if (rsp["data"]["success"]) {
        setClients(rsp["data"]["data"]);
      }
    }).catch(function (err) {
      console.log(err);
    });
  }, []);

  return (
    <div>
      <div>
        {PAGES.map(page => (
          <button onClick={() => setActivepage(page)} key={page}>{page}</button>
        ))}
      </div>
      <div>
        {activePage === "system" && <SystemList clients={clients} />}
        {activePage === "logic" && <LogicList clients={clients} />}
        {activePage === "symbol" && <SymbolList clients={clients} />}
        {activePage === "account" && <AccountList clients={clients} />}
      </div>
    </div>
  );
};
