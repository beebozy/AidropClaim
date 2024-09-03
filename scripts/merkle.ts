
import { ethers } from "hardhat";
import fs from "fs";
import csv from "csv-parser";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

const CSV_FILE_PATH = "airdrop/airdropAddresses.csv";

const leafNodes: Buffer[] = [];

fs.createReadStream(CSV_FILE_PATH)
	.pipe(csv())
	.on("data", (row: { address: string; amount: number }) => {
		const address = row.address;
		const amount = ethers.parseUnits(row.amount.toString(), 18);

		// Correct hashing to create a leaf node (bytes32)
		const leaf = keccak256(
			ethers.solidityPacked(["address", "uint256"], [address, amount])
		);
		// console.log(leaf.toString('utf-8'))
		leafNodes.push(leaf);

		// Convert buffer to a readable hex string and print it
		//   console.log(`Leaf (Hex): ${leaf.toString('hex')}`);
	})
	.on("end", () => {
		const merkleTree = new MerkleTree(leafNodes, keccak256, {
			sortPairs: true,
		});

		const rootHash = merkleTree.getHexRoot();
		console.log("Merkle Root:", rootHash);

		// Extracting proof for this address
		const address = "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2";
		const amount = ethers.parseUnits("234", 18);

		// Create leaf for proof
		const leaf = keccak256(
			ethers.solidityPacked(["address", "uint256"], [address, amount])
		);

		console.log("Leaf:", leaf.toString("hex"));

		const proof = merkleTree.getHexProof(leaf);
		console.log("Proof:", proof);
	});

// need to install dependencies