//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IQueueDistribution {
    function incrementBalance(uint amount) external;

    function claim(uint256 index, uint queueId) external;

    function addToQueue(uint256 tokenId) external;

    function getCurrentIndex() external view returns (uint);
}
