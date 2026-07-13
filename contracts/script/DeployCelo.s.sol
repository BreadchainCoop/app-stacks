// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {TransparentUpgradeableProxy} from "@openzeppelin/proxy/transparent/TransparentUpgradeableProxy.sol";
import {ProxyAdmin} from "@openzeppelin/proxy/transparent/ProxyAdmin.sol";
import {IERC20Metadata} from "@openzeppelin/token/ERC20/extensions/IERC20Metadata.sol";

import {SavingCircles} from "saving-circles/src/contracts/SavingCircles.sol";
import {AutomaticSavingCircles} from "saving-circles/src/contracts/AutomaticSavingCircles.sol";
import {SavingCirclesViewer} from "saving-circles/src/contracts/SavingCirclesViewer.sol";

/// @notice Celo mainnet deployment (issue #154). Unlike Deploy.s.sol this does
///         NOT deploy a mock token — the deposit token is an existing
///         stablecoin (USDT 0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e by
///         default, 6 decimals), passed via DEPOSIT_TOKEN_ADDRESS.
contract DeployCelo is Script {
    function run() external {
        // Admin that will own SavingCircles + ProxyAdmin
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address depositToken = vm.envAddress("DEPOSIT_TOKEN_ADDRESS");

        // Sanity-check the token exists and read its metadata for the logs
        string memory tokenSymbol = IERC20Metadata(depositToken).symbol();
        uint8 tokenDecimals = IERC20Metadata(depositToken).decimals();

        vm.startBroadcast();

        SavingCircles implementation = new SavingCircles();
        ProxyAdmin proxyAdmin = new ProxyAdmin(admin);

        bytes memory initData =
            abi.encodeWithSelector(SavingCircles.initialize.selector, admin);

        TransparentUpgradeableProxy proxy =
            new TransparentUpgradeableProxy(
                address(implementation),
                address(proxyAdmin),
                initData
            );

        SavingCircles savingCircles = SavingCircles(address(proxy));

        AutomaticSavingCircles automaticSavingCircles =
            new AutomaticSavingCircles(address(savingCircles), admin);

        SavingCirclesViewer viewer =
            new SavingCirclesViewer(address(savingCircles));

        // Requires the broadcasting key to be the admin (setTokenAllowed is onlyOwner)
        savingCircles.setTokenAllowed(depositToken, true);

        require(savingCircles.owner() == admin, "SavingCircles owner != admin");
        require(savingCircles.allowedTokens(depositToken) == true, "deposit token not allowed");

        console2.log("Deposit token:", depositToken);
        console2.log("  symbol:", tokenSymbol);
        console2.log("  decimals:", tokenDecimals);
        console2.log("SavingCircles implementation:", address(implementation));
        console2.log("SavingCircles proxy:", address(savingCircles));
        console2.log("ProxyAdmin:", address(proxyAdmin));
        console2.log("AutomaticSavingCircles:", address(automaticSavingCircles));
        console2.log("SavingCirclesViewer:", address(viewer));

        vm.stopBroadcast();

        // Same JSON shape as Deploy.s.sol so `make update-env` keeps working;
        // "breadToken" carries the deposit token (USDT) on Celo.
        string memory key = "deployment";
        vm.serializeAddress(key, "breadToken", depositToken);
        vm.serializeAddress(key, "savingCirclesProxy", address(savingCircles));
        vm.serializeAddress(key, "savingCirclesImplementation", address(implementation));
        vm.serializeAddress(key, "proxyAdmin", address(proxyAdmin));
        vm.serializeAddress(key, "automaticSavingCircles", address(automaticSavingCircles));
        string memory json =
            vm.serializeAddress(key, "savingCirclesViewer", address(viewer));

        vm.writeJson(json, "./out/SAVING_CIRCLES_DEPLOYMENT.json");
    }
}
