// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "./IQueueDistribution.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./IBTCACollection.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MultiCall is Ownable, ERC1155Holder {
    using SafeERC20 for IERC20;

    IQueueDistribution public queueDistribution;
    IBTCACollection public BTCACollection;

    uint256[] public tokenIds;
    IERC20 token;

    constructor(
        address initialOwner,
        address collection,
        address queue,
        address _token
    ) Ownable(initialOwner) {
        BTCACollection = IBTCACollection(collection);
        queueDistribution = IQueueDistribution(queue);
        token = IERC20(token);
    }

    function setQueueDistribution(address _queue) external onlyOwner {
        queueDistribution = IQueueDistribution(_queue);
    }

    function depositNFT(uint256 tokenId) external onlyOwner {
        BTCACollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            1,
            ""
        );

        tokenIds.push(tokenId);
    }

    function withdrawNFT() external onlyOwner {
        require(tokenIds.length > 0, "No NFTs to withdraw");

        uint256 tokenId = tokenIds[0];

        removeTokenIdAtIndex(0);

        BTCACollection.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            1,
            ""
        );
    }

    function removeTokenIdAtIndex(uint256 index) internal {
        require(index < tokenIds.length, "Index out of bounds");

        tokenIds[index] = tokenIds[tokenIds.length - 1];

        tokenIds.pop();
    }

    function multiCall() external onlyOwner {
        require(tokenIds.length > 0, "No nfts");

        uint256 tokenId1 = tokenIds[0];
        uint256 tokenId2 = tokenIds[1];

        removeTokenIdAtIndex(0);
        removeTokenIdAtIndex(0);

        queueDistribution.addToQueue(tokenId1);
        queueDistribution.addToQueue(tokenId2);

        uint position = queueDistribution.getCurrentIndex();
        uint queueId = BTCACollection.getCurrentBatch();

        queueDistribution.claim(position - 1, queueId);
    }

    function setApprovalForAll() external onlyOwner {
        BTCACollection.setApprovalForAll(address(queueDistribution), true);
    }
}
