// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ReservePools is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdToken;

    uint256 public virtualBalance;

    address public collection;

    event BalanceIncremented(uint256 amount);
    event Swapped(uint256 usdAmount, uint256 btcaAmount);
    event ClaimedBTCA(address indexed user, uint256 amount);

    constructor(IERC20 _usdToken, address initialOwner) Ownable(initialOwner) {
        usdToken = _usdToken;
    }

    function setCollection(address _collection) external onlyOwner {
        collection = _collection;
    }

    function incrementBalance(uint256 amount) external onlyCollection {
        virtualBalance += amount;
        emit BalanceIncremented(amount);
    }

    function swap(uint256 usdAmount) external {
        require(usdAmount > 0, "Amount must be greater than 0");

        virtualBalance -= usdAmount;

        // emit Swapped(usdAmount, btcaAmount);
    }

    function collectBTCA(uint amount) external onlyOwner {
        require(
            usdToken.balanceOf(address(this)) > amount,
            "Insufficient funds"
        );
        usdToken.safeTransfer(msg.sender, amount);
    }

    modifier onlyCollection() {
        require(
            collection == msg.sender,
            "Only the collection contract can call this function."
        );
        _;
    }
}
