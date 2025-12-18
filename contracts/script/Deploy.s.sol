// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {TransparentUpgradeableProxy} from "@openzeppelin/proxy/transparent/TransparentUpgradeableProxy.sol";
import {ProxyAdmin} from "@openzeppelin/proxy/transparent/ProxyAdmin.sol";

import {SavingCircles} from "saving-circles/src/contracts/SavingCircles.sol";
import {DelegatedSavingCircles} from "saving-circles/src/contracts/DelegatedSavingCircles.sol";
import {SavingCirclesViewer} from "saving-circles/src/contracts/SavingCirclesViewer.sol";

import {MockBread} from "./MockBread.sol";

contract Deploy is Script {
    function run() external {
        // Admin that will own SavingCircles + ProxyAdmin
        address admin = vm.envAddress("ADMIN_ADDRESS");

        uint256 initialBreadSupply = 1_000_000e18;

        vm.startBroadcast();

        MockBread bread = new MockBread(admin, admin, initialBreadSupply);

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

        savingCircles.setTokenAllowed(address(bread), true);

        require(savingCircles.owner() == admin, "SavingCircles owner != admin");
        require(savingCircles.allowedTokens(address(bread)) == true, "BREAD not allowed");
        require(address(delegatedSavingCircles.SAVING_CIRCLES()) == address(savingCircles), "Bad delegated SAVING_CIRCLES");

        // Logs
        console2.log("MockBread (BREAD):", address(bread));
        console2.log("SavingCircles implementation:", address(implementation));
        console2.log("SavingCircles proxy:", address(savingCircles));
        console2.log("ProxyAdmin:", address(proxyAdmin));
        console2.log("DelegatedSavingCircles:", address(delegatedSavingCircles));
        console2.log("SavingCirclesViewer:", address(viewer));

        vm.stopBroadcast();

        // Persist to JSON under ./out
        string memory key = "deployment";
        vm.serializeAddress(key, "breadToken", address(bread));
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
