import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

async function setupMultisigModule() {
  
    return buildModule("MultisigModule", (m) => {
      const token = m.contract("SmartDevToken");
      const multisig = m.contract("Multisig", [token]);
  
      return { token, multisig };
    });
  }
  
  export default setupMultisigModule;