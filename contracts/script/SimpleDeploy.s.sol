// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {SavingCircles} from "../stacks/src/contracts/SavingCircles.sol";

/**
 * @title Simple Deploy Script for SavingCircles Contract
 * @dev This script deploys the SavingCircles contract to a local Anvil server
 */
contract SimpleDeploy is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy the SavingCircles contract
        SavingCircles savingCircles = new SavingCircles();
        
        // Note: This contract is designed for upgradeable patterns
        // The initialize function may not work as expected when deployed directly
        // For now, we'll deploy without initialization
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("=== SavingCircles Contract Deployment ===");
        console.log("Contract Address:", address(savingCircles));
        console.log("Deployer Address:", msg.sender);
        console.log("Chain ID:", block.chainid);
        console.log("Block Number:", block.number);
        
        console.log("=== Deployment Complete ===");
        console.log("SavingCircles contract successfully deployed to:", address(savingCircles));
        console.log("Note: This is an upgradeable contract that requires proxy deployment for full functionality");
        console.log("Minimum members required:", savingCircles.MINIMUM_MEMBERS());
    }
}
