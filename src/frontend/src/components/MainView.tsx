import React, { useState } from 'react';
import { SystemList } from './SystemList';
import { LogicList } from './LogicList';
import { SymbolList } from './SymbolList';
import { AccountList } from './AccountList';

const PAGES: Array<string> = [
    "system",
    "logic",
    "symbol",
    "account"
];

export const MainView = () => {
    const [activePage, setActivepage] = useState(PAGES[0]);
    return (
        <div>
            <div>
                {PAGES.map(page => (
                    <button onClick={() => setActivepage(page)}>{page}</button>
                ))}
            </div>
            <div>
                {activePage === "system" && SystemList}
                {activePage === "logic" && LogicList}
                {activePage === "symbol" && SymbolList}
                {activePage === "account" && AccountList}
            </div>
        </div>
    );
};
