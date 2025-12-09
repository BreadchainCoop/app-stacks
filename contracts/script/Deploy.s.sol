// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {TransparentUpgradeableProxy} from "@openzeppelin/proxy/transparent/TransparentUpgradeableProxy.sol";
import {ProxyAdmin} from "@openzeppelin/proxy/transparent/ProxyAdmin.sol";

import {SavingCircles} from "saving-circles/src/contracts/SavingCircles.sol";
import {DelegatedSavingCircles} from "saving-circles/src/contracts/DelegatedSavingCircles.sol";
import {SavingCirclesViewer} from "saving-circles/src/contracts/SavingCirclesViewer.sol";

contract Deploy is Script {
    function run() external {
        // Admin that will own SavingCircles + ProxyAdmin
        address admin = vm.envAddress("ADMIN_ADDRESS");

        vm.startBroadcast();

        // 1. Implementation + ProxyAdmin
        SavingCircles implementation = new SavingCircles();
        ProxyAdmin proxyAdmin = new ProxyAdmin(admin);

        // 2. Proxy with initializer
        bytes memory initData =
            abi.encodeWithSelector(SavingCircles.initialize.selector, admin);

        TransparentUpgradeableProxy proxy =
            new TransparentUpgradeableProxy(
                address(implementation),
                address(proxyAdmin),
                initData
            );

        SavingCircles savingCircles = SavingCircles(address(proxy));

        // 3. Helper contracts
        DelegatedSavingCircles delegatedSavingCircles =
            new DelegatedSavingCircles(address(savingCircles));

        SavingCirclesViewer viewer =
            new SavingCirclesViewer(address(savingCircles));

        // Logs
        console2.log("SavingCircles implementation:", address(implementation));
        console2.log("SavingCircles proxy:", address(savingCircles));
        console2.log("ProxyAdmin:", address(proxyAdmin));
        console2.log("DelegatedSavingCircles:", address(delegatedSavingCircles));
        console2.log("SavingCirclesViewer:", address(viewer));

        vm.stopBroadcast();

        // Persist to JSON under ./out
        string memory key = "deployment";
        vm.serializeAddress(key, "savingCirclesProxy", address(savingCircles));
        vm.serializeAddress(
            key,
            "savingCirclesImplementation",
            address(implementation)
        );
        vm.serializeAddress(key, "proxyAdmin", address(proxyAdmin));
        vm.serializeAddress(
            key,
            "delegatedSavingCircles",
            address(delegatedSavingCircles)
        );
        string memory json =
            vm.serializeAddress(key, "savingCirclesViewer", address(viewer));

        vm.writeJson(json, "./out/SAVING_CIRCLES_DEPLOYMENT.json");
    }
}
