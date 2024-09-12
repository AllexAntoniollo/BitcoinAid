// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract QueueDistribution is ERC1155Holder {
    IERC1155 public BTCACollection;

    struct QueueEntry {
        address user;
        uint256 next;
        uint256 prev;
        uint256 index;
    }

    uint256 public head;
    uint256 public tail;
    uint256 public queueSize;
    uint256 private currentIndex;

    mapping(uint256 => QueueEntry) public queue;

    constructor(address _collection) {
        BTCACollection = IERC1155(_collection);
        currentIndex = 1;
    }

    function addToQueue(uint256 tokenId) external {
        BTCACollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            1,
            ""
        );

        QueueEntry memory newEntry = QueueEntry({
            user: msg.sender,
            next: 0,
            prev: tail,
            index: currentIndex
        });

        if (queueSize == 0) {
            head = currentIndex;
        } else {
            queue[tail].next = currentIndex;
        }

        queue[currentIndex] = newEntry;
        tail = currentIndex;

        queueSize++;
        currentIndex++;
    }

    function removeFromQueue(uint256 index) external {
        require(index <= currentIndex, "Invalid index");
        require(
            queue[index].user == msg.sender,
            "You can only remove your own entry"
        );

        QueueEntry storage entry = queue[index];

        if (entry.prev != 0) {
            queue[entry.prev].next = entry.next;
        } else {
            head = entry.next;
        }

        if (entry.next != 0) {
            queue[entry.next].prev = entry.prev;
        } else {
            tail = entry.prev;
        }

        queueSize--;

        delete queue[index];
    }

    function getQueueDetails() external view returns (QueueEntry[] memory) {
        QueueEntry[] memory queueDetails = new QueueEntry[](queueSize);
        uint256 actual = head;
        uint256 i = 0;

        while (actual != 0) {
            queueDetails[i] = queue[actual];
            queueDetails[i].index = actual;
            actual = queue[actual].next;
            i++;
        }

        return queueDetails;
    }
}
