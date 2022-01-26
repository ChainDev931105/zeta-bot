
export enum ORDER_COMMAND {
  None = 0,
  Buy = 1,
  Sell = 2,
  BuyClose = 3,
  SellClose = 4
}

export enum ORDER_KIND {
  Market = 0,
  Limit = 1,
  Slippage = 2,
  TWAP = 3
}

export enum ORDER_ACCEPT {
  StopOrder = 0,
  StopOpen = 1,
  StopClose = 2,
  StopBuy = 3,
  StopSell = 4,
  NoStop = 5,
  ManualStep = 6
}
