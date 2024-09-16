// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IQueueDistribution.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./IBTCACollection.sol";

contract MultiCall is Ownable, ERC1155Holder {
    IQueueDistribution public queueDistribution;
    IBTCACollection public BTCACollection;

    constructor(
        address initialOwner,
        address collection
    ) Ownable(initialOwner) {
        BTCACollection = IBTCACollection(collection);
    }

    function setQueueDistribution(address _queue) external onlyOwner {
        queueDistribution = IQueueDistribution(_queue);
    }

    function multiCall() external onlyOwner {}
}
