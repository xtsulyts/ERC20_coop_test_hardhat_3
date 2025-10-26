import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CooperadoraModule", (m) => {
  const cooperadora = m.contract("CooperadoraTest");

  return { cooperadora };
});