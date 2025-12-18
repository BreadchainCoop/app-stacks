// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @notice Local-only mock of BREAD for Anvil.
///         Standard ERC20 + owner mint faucet.
contract MockBread is ERC20, Ownable {
    constructor(address owner_, address initialHolder_, uint256 initialSupply_)
        ERC20("Bread", "BREAD")
        Ownable(owner_)
    {
        if (initialSupply_ > 0) _mint(initialHolder_, initialSupply_);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
