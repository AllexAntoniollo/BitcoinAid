// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IPaymentManager.sol";

contract BTCACollection is ERC1155, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint public currentBatch = 1;
    uint public totalMintedInBatch = 0;
    uint public constant batchSize = 100;
    IPaymentManager public paymentManager;
    IPaymentManager public reservePools;
    IPaymentManager public reserveBtca;

    constructor(
        address initialOwner,
        address _token,
        address _paymentManager
    ) ERC1155("URI") Ownable(initialOwner) {
        token = IERC20(_token);
        paymentManager = IPaymentManager(_paymentManager);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setPaymentManager(address _paymentManager) external onlyOwner {
        paymentManager = IPaymentManager(_paymentManager);
    }

    function setReservePools(address _reservePools) external onlyOwner {
        reservePools = IPaymentManager(_reservePools);
    }

    function setReserveBtca(address _reserveBtca) external onlyOwner {
        reserveBtca = IPaymentManager(_reserveBtca);
    }

    function getCurrentBatch() public view returns (uint) {
        return currentBatch;
    }

    function getBatchPrice(uint batch) public pure returns (uint256) {
        if (batch <= 7) {
            return 10 * (2 ** (batch - 1));
        } else if (batch <= 14) {
            return (960 * (150 ** (batch - 8))) / (100 ** (batch - 8));
        } else if (batch <= 21) {
            return (1366875 * (125 ** (batch - 15))) / (100 ** (batch - 15));
        } else if (batch <= 29) {
            return (5840241 * (112 ** (batch - 22))) / (100 ** (batch - 22));
        } else {
            return (13814675 * (107 ** (batch - 30))) / (100 ** (batch - 30));
        }
    }

    function getCurrentBatchPrice() public view returns (uint256) {
        return getBatchPrice(currentBatch);
    }

    function mint(uint256 amount) public {
        if (amount + totalMintedInBatch > batchSize) {
            amount = batchSize - totalMintedInBatch;
        }

        uint256 price = getCurrentBatchPrice();
        uint256 totalPrice = price * amount * 10 ** 6;

        token.safeTransferFrom(msg.sender, address(this), totalPrice);
        token.safeTransfer(address(paymentManager), totalPrice / 4);
        token.safeTransfer(address(reserveBtca), totalPrice / 4);
        token.safeTransfer(address(reservePools), totalPrice / 2);

        paymentManager.incrementBalance(totalPrice / 4);
        reserveBtca.incrementBalance(totalPrice / 4);
        reservePools.incrementBalance(totalPrice / 2);

        _mint(msg.sender, currentBatch, amount, "");

        updateBatch(amount);
    }

    function updateBatch(uint256 amountMinted) internal {
        totalMintedInBatch += amountMinted;
        if (totalMintedInBatch >= batchSize) {
            totalMintedInBatch = 0;
            currentBatch++;
        }
    }
}
