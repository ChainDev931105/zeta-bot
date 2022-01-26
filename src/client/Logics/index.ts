import { LogicConfig } from "../../common/config";
import { Logic } from "./Logic";
import { ArbitrageLogic } from "./ArbitrageLogic";
import { TWAPLogic } from "./TWAPLogic";


export const CreateLogic: ((logicConfig: LogicConfig) => Logic) = (logicConfig: LogicConfig) => {
  let logic: Logic;
  if (logicConfig.logic_type === "ArbitrageLogic") {
    logic = new ArbitrageLogic();
  }
  else if (logicConfig.logic_type === "TWAPLogic") {
    logic = new TWAPLogic();
  }
  else {
    logic = new Logic();
  }
  logic.m_logicConfig = logicConfig;
  logicConfig.parameters.forEach(param => {
    logic.SetParam(param[0], param[1]);
  });

  return logic;
}

export { Logic };
