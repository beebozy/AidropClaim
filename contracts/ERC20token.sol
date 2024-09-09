// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BEEBToken is ERC20 {
    address public owner;

    constructor() ERC20("BEEBToken", "BTK") {
        owner = msg.sender;  // Set the contract deployer as the owner

        // Mint 10,000 tokens with 18 decimals to the owner
        _mint(msg.sender, 10000 * 10 ** decimals());
        
    }
}