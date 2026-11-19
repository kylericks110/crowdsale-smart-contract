// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title LeadCoinV2
 * @notice Standalone, unaudited prototype. Not a migration of existing LDC balances.
 * @dev Non-upgradeable ERC-20 with EIP-2612 permits and immutable genesis supply.
 *      All tokens are minted once to a designated treasury at construction.
 *      No owner, upgrade, mint, pause, blacklist, or arbitrary burn functions.
 */
contract LeadCoinV2 is ERC20, ERC20Permit {
    error ZeroTreasury();
    error ZeroGenesisSupply();

    address public immutable genesisTreasury;
    uint256 public immutable genesisSupply;

    constructor(address treasury_, uint256 supply_)
        ERC20("LeadCoin V2", "LDC")
        ERC20Permit("LeadCoin V2")
    {
        if (treasury_ == address(0)) revert ZeroTreasury();
        if (supply_ == 0) revert ZeroGenesisSupply();

        genesisTreasury = treasury_;
        genesisSupply = supply_;
        _mint(treasury_, supply_);
    }
}
