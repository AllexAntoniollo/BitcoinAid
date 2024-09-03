// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BitcoinAid is ERC20, ERC20Burnable {
    constructor() ERC20("Bitcoin Aid", "BTCA") {
        _mint(msg.sender, 2100000000 * 10 ** decimals());
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        uint256 burnAmount = amount / 100;
        uint256 transferAmount = amount - burnAmount;

        _burn(_msgSender(), burnAmount);
        return super.transfer(recipient, transferAmount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        uint256 burnAmount = amount / 100;
        uint256 transferAmount = amount - burnAmount;

        _burn(sender, burnAmount);
        return super.transferFrom(sender, recipient, transferAmount);
    }
}
