import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ERC20Module = buildModule("ERC20Module", (m) => {
 
  const lock = m.contract("BEEBTokenMerkleAirdrop");

  return { lock };
});

export default ERC20Module;
