import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
 
  const lock = m.contract("MerkleAirdrop");

  return { lock };
});

export default MerkleAirdropModule;
