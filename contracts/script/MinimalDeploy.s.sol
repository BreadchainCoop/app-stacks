// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {SavingCircles} from "../stacks/src/contracts/SavingCircles.sol";

/**
 * @title Minimal Deploy Script for SavingCircles Contract
 * @dev This script deploys the SavingCircles contract to a local Anvil server
 */
contract MinimalDeploy is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy the SavingCircles contract
        SavingCircles savingCircles = new SavingCircles();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Return the deployed contract address
        // This will be shown in the forge output
    }
}

