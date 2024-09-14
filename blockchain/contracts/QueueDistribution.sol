// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./IBTCACollection.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IUniswapOracle.sol";
import "hardhat/console.sol";

contract QueueDistribution is ERC1155Holder {
    using SafeERC20 for IERC20;

    IBTCACollection public BTCACollection;

    struct QueueEntry {
        address user;
        uint256 next;
        uint256 prev;
        uint256 index;
        uint amount;
        uint batchLevel;
        uint dollarsClaimed;
        uint tokensToClaim;
    }

    uint256 public head;
    uint256 public tail;
    uint256 public queueSize;
    uint256 private currentIndex;

    uint public balanceFree;

    IERC20 token;

    QueueEntry[] public removedQueueEntries;
    mapping(address => uint256) public tokensToWithdraw;

    mapping(uint256 => QueueEntry) public queue;
    IUniswapOracle public uniswapOracle;

    constructor(address _collection, address _token, address _oracle) {
        BTCACollection = IBTCACollection(_collection);
        token = IERC20(_token);
        currentIndex = 1;
        uniswapOracle = IUniswapOracle(_oracle);
    }

    function addToQueue(uint256 tokenId, uint amount) external {
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
            index: currentIndex,
            amount: amount,
            batchLevel: BTCACollection.getCurrentBatch(),
            dollarsClaimed: 0,
            tokensToClaim: 0
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

    function incrementBalance(uint amount) external {
        balanceFree += amount;
    }

    function claim(uint256 index) external {
        require(
            queueSize > 3,
            "Queue must be even-sized and contain at least 4 users"
        );
        require(index >= head && index <= tail, "Invalid index");
        require(
            queue[index].user == msg.sender,
            "You can only claim your own entry"
        );

        uint256 tokenPrice = uniswapOracle.returnPrice();
        uint256 currentHead = head;
        uint256 currentTail = tail;

        while (
            currentHead <= index && currentTail >= index && balanceFree > 0
        ) {
            if (head != index) {
                processPaymentForIndex(head, tokenPrice);
            }

            if (tail != index) {
                processPaymentForIndex(tail, tokenPrice);
            }

            if (head == currentHead) {
                if (queue[currentHead].next != index) {
                    processPaymentForIndex(queue[currentHead].next, tokenPrice);
                }
            } else {
                if (head != index) {
                    processPaymentForIndex(head, tokenPrice);
                }
            }

            if (tail == currentTail) {
                if (queue[currentTail].next != index) {
                    console.log(queue[currentTail].prev);
                    processPaymentForIndex(queue[currentTail].prev, tokenPrice);
                }
            } else {
                if (tail != index) {
                    processPaymentForIndex(tail, tokenPrice);
                }
            }

            if (currentHead == index || currentTail == index) {
                break;
            }
            currentHead = head;
            currentTail = tail;
        }

        processPaymentForIndex(index, tokenPrice);
        token.safeTransfer(msg.sender, tokensToWithdraw[msg.sender]);
        tokensToWithdraw[msg.sender] = 0;
    }

    function processPaymentForIndex(
        uint256 current,
        uint256 tokenPrice
    ) internal {
        QueueEntry storage entry = queue[current];
        uint256 batchPrice = BTCACollection.getBatchPrice(entry.batchLevel) *
            10 ** 6;
        uint256 maxClaim = (batchPrice * 3) - entry.dollarsClaimed;

        uint256 totalToClaim = (maxClaim * 1e18) / tokenPrice;

        uint256 payableAmount = totalToClaim > balanceFree
            ? balanceFree
            : totalToClaim;

        balanceFree -= payableAmount;

        entry.tokensToClaim += payableAmount;
        tokensToWithdraw[entry.user] += payableAmount;

        if (payableAmount == totalToClaim) {
            removeFromQueue(current);
        }

        entry.dollarsClaimed += (payableAmount * tokenPrice) / 1e18;
    }

    function removeFromQueue(uint256 index) internal {
        require(index <= currentIndex && index >= head, "Invalid index");

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

        removedQueueEntries.push(entry);

        queueSize--;

        delete queue[index];
    }

    function getRemovedQueueEntries()
        external
        view
        returns (QueueEntry[] memory)
    {
        return removedQueueEntries;
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

    function withdrawTokens() external {
        uint256 amount = tokensToWithdraw[msg.sender];
        require(amount > 0, "No tokens to withdraw");
        tokensToWithdraw[msg.sender] = 0;
        token.safeTransfer(msg.sender, amount);
    }
}
