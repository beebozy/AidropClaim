import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import keccak256 from "keccak256";
import { MerkleTree } from "merkletreejs";

describe("ERC20token", function () {
  
  // Deploy ERC20 token contract
  async function deployToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const TokenFactory = await hre.ethers.getContractFactory("BEEBToken");
    const deployedToken = await TokenFactory.deploy();
    return { owner, otherAccount, deployedToken };
  }

  // Deploy Airdrop contract with Merkle Tree
  async function deployAirdropClaimContract() {
    const [owner, account1, account2] = await hre.ethers.getSigners();

    // Deploy the ERC20 token first
    const { deployedToken } = await loadFixture(deployToken);

    // Create a Merkle Tree based on addresses and amounts
    const leafNodes = [owner, account1, account2].map((signer) => {
      return keccak256(ethers.solidityPacked(
        ["address", "uint256"],
        [signer.address, ethers.parseUnits("100", 18)] // Example amount
      ));
    });
    
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const root = merkleTree.getHexRoot(); // Get the Merkle Root

    // Deploy the Merkle Airdrop contract with the root and token address
    const AirdropClaimFactory = await hre.ethers.getContractFactory("MerkleAirdrop");
    const deployedAirdropClaimContract = await AirdropClaimFactory.deploy(root, deployedToken);

    return { owner, account1, account2, deployedAirdropClaimContract, merkleTree, deployedToken };
  }

  it("should allow a valid claim from the Merkle Airdrop contract", async function () {
    const { account1, deployedAirdropClaimContract, merkleTree } = await loadFixture(deployAirdropClaimContract);

    // Get proof for account1
    const leaf = keccak256(ethers.solidityPacked(["address", "uint256"], [account1.address, ethers.parseUnits("100", 18)]));
    const proof = merkleTree.getHexProof(leaf);

    // Claim tokens
    await expect(deployedAirdropClaimContract.connect(account1).claimAirdrop(ethers.parseUnits("100", 18), proof, account1.address))
      .to.emit(deployedAirdropClaimContract, "ClaimDetails")
      .withArgs(ethers.parseUnits("100", 18), account1.address);
  });
});