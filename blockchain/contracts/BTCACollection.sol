// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
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

    function getCurrentBatchPrice() public view returns (uint256) {
        if (currentBatch <= 7) {
            return 10 * (2 ** (currentBatch - 1));
        } else if (currentBatch <= 14) {
            return (960 * (150 ** (currentBatch - 8))) / 100;
        } else if (currentBatch <= 21) {
            return (13668 * (125 ** (currentBatch - 15))) / 100;
        } else if (currentBatch <= 29) {
            return (58402 * (112 ** (currentBatch - 22))) / 100;
        } else {
            return (129106 * (107 ** (currentBatch - 30))) / 100;
        }
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
