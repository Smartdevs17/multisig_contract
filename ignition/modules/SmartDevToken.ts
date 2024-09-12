import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SmartDevTokenModule = buildModule("SmartDevTokenModule", (m) => {
  
  const smartDevToken = m.contract("SmartDevToken");

  return { smartDevToken };
});

export default SmartDevTokenModule;