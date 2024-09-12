// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract BTCACollection is ERC1155, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint public currentBatch = 1;
    uint public totalMintedInBatch = 0;
    uint public constant batchSize = 100;

    constructor(
        address initialOwner,
        address _token
    ) ERC1155("URI") Ownable(initialOwner) {
        token = IERC20(_token);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
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
        require(
            amount + totalMintedInBatch <= batchSize,
            "The batch limit was reached"
        );
        uint256 price = getCurrentBatchPrice();
        uint256 totalPrice = price * amount * 10 ** 6;

        token.safeTransferFrom(msg.sender, address(this), totalPrice);

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
