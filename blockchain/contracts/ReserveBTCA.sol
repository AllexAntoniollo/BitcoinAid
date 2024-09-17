// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ReserveBTCA is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdToken;
    IERC20 public btcaToken;

    uint256 public virtualBalance;

    address public collection;

    event BalanceIncremented(uint256 amount);
    event Swapped(uint256 usdAmount, uint256 btcaAmount);
    event ClaimedBTCA(address indexed user, uint256 amount);
    event CollectionSet(address indexed collectionAddress);

    constructor(
        IERC20 _usdToken,
        IERC20 _btcaToken,
        address initialOwner
    ) Ownable(initialOwner) {
        usdToken = _usdToken;
        btcaToken = _btcaToken;
    }

    function setCollection(address _collection) external onlyOwner {
        require(
            _collection != address(0),
            "Collection address cannot be zero address"
        );
        collection = _collection;
        emit CollectionSet(_collection);
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

    function collectBTCA() external onlyOwner {
        require(btcaToken.balanceOf(address(this)) > 0, "Insufficient funds");
        btcaToken.safeTransfer(msg.sender, btcaToken.balanceOf(address(this)));
    }

    modifier onlyCollection() {
        require(
            collection == msg.sender,
            "Only the collection contract can call this function."
        );
        _;
    }
}
