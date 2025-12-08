// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";
import {SavingCircles} from "../stacks/src/contracts/SavingCircles.sol";

/**
 * @title Deploy and Update Script for SavingCircles Contract
 * @dev This script deploys the SavingCircles contract and outputs the address for easy copying
 */
contract DeployAndUpdate is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Deploy the SavingCircles contract
        SavingCircles savingCircles = new SavingCircles();
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Output the contract address in a format that's easy to copy
        emit Deployed(address(savingCircles));
    }
    
    event Deployed(address indexed contractAddress);
}




