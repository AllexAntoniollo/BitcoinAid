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
        uint batchLevel;
        uint dollarsClaimed;
    }
    uint public totalNFTsInQueue;

    mapping(uint256 => uint256) public headByBatch;
    mapping(uint256 => uint256) public tailByBatch;
    mapping(uint256 => uint256) public queueSizeByBatch;
    mapping(uint256 => mapping(uint256 => QueueEntry)) public queueByBatch;
    uint public lastUnpaidQueue = 1;

    uint public balanceFree;
    uint256 public currentIndex;

    IERC20 token;

    mapping(address => uint256) public tokensToWithdraw;

    IUniswapOracle public uniswapOracle;

    constructor(address _collection, address _token, address _oracle) {
        BTCACollection = IBTCACollection(_collection);
        token = IERC20(_token);
        currentIndex = 1;
        uniswapOracle = IUniswapOracle(_oracle);
    }

    function addToQueue(uint256 tokenId) external {
        BTCACollection.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            1,
            ""
        );

        uint batchLevel = BTCACollection.getCurrentBatch();
        QueueEntry memory newEntry = QueueEntry({
            user: msg.sender,
            next: 0,
            prev: tailByBatch[batchLevel],
            index: currentIndex,
            batchLevel: batchLevel,
            dollarsClaimed: 0
        });

        if (queueSizeByBatch[batchLevel] == 0) {
            headByBatch[batchLevel] = currentIndex;
        } else {
            queueByBatch[batchLevel][tailByBatch[batchLevel]]
                .next = currentIndex;
        }

        queueByBatch[batchLevel][currentIndex] = newEntry;
        tailByBatch[batchLevel] = currentIndex;

        queueSizeByBatch[batchLevel]++;
        totalNFTsInQueue++;

        currentIndex++;
    }

    function incrementBalance(uint amount) external {
        balanceFree += amount;
    }

    function claim(uint256 index, uint queueId) external {
        require(
            index >= headByBatch[queueId] && index <= tailByBatch[queueId],
            "Invalid index"
        );
        require(
            queueByBatch[queueId][index].user == msg.sender,
            "You can only claim your own entry"
        );

        uint256 tokenPrice = uniswapOracle.returnPrice();

        uint256 requiredBalance = getRequiredBalanceForNextFour();
        require(
            balanceFree >= requiredBalance,
            "Not enough balance to process payment for 4 entries"
        );

        uint256 currentHead = headByBatch[lastUnpaidQueue];
        uint256 currentTail = tailByBatch[lastUnpaidQueue];
        bool foundClaimedEntry = false;

        while (queueSizeByBatch[lastUnpaidQueue] > 0 && balanceFree > 0) {
            require(totalNFTsInQueue >= 4, "Minimum 4 nfts to claim prizes");
            if (headByBatch[lastUnpaidQueue] != index) {
                processPaymentForIndex(
                    headByBatch[lastUnpaidQueue],
                    tokenPrice
                );
            } else {
                foundClaimedEntry = true;
            }

            if (tailByBatch[lastUnpaidQueue] != index) {
                processPaymentForIndex(
                    tailByBatch[lastUnpaidQueue],
                    tokenPrice
                );
            } else {
                foundClaimedEntry = true;
            }

            if (headByBatch[lastUnpaidQueue] == currentHead) {
                if (queueByBatch[lastUnpaidQueue][currentHead].next != index) {
                    processPaymentForIndex(
                        queueByBatch[lastUnpaidQueue][currentHead].next,
                        tokenPrice
                    );
                } else {
                    foundClaimedEntry = true;
                }
            } else {
                if (headByBatch[lastUnpaidQueue] != index) {
                    processPaymentForIndex(
                        headByBatch[lastUnpaidQueue],
                        tokenPrice
                    );
                } else {
                    foundClaimedEntry = true;
                }
            }
            if (tailByBatch[lastUnpaidQueue] == currentTail) {
                if (queueByBatch[lastUnpaidQueue][currentTail].next != index) {
                    processPaymentForIndex(
                        queueByBatch[lastUnpaidQueue][currentTail].prev,
                        tokenPrice
                    );
                } else {
                    foundClaimedEntry = true;
                }
            } else {
                if (tailByBatch[lastUnpaidQueue] != index) {
                    processPaymentForIndex(
                        tailByBatch[lastUnpaidQueue],
                        tokenPrice
                    );
                } else {
                    foundClaimedEntry = true;
                }
            }

            if (foundClaimedEntry) {
                break;
            }
            currentHead = headByBatch[lastUnpaidQueue];
            currentTail = tailByBatch[lastUnpaidQueue];
        }

        processPaymentForIndex(index, tokenPrice);

        token.safeTransfer(msg.sender, tokensToWithdraw[msg.sender]);
        tokensToWithdraw[msg.sender] = 0;
    }

    function getRequiredBalanceForNextFour() internal view returns (uint256) {
        uint256 tokenPrice = uniswapOracle.returnPrice();
        uint256 totalRequiredBalance = 0;
        uint256 counter = 0;
        uint256 currentBatch = lastUnpaidQueue;
        uint256 currentHead = headByBatch[currentBatch];

        while (counter < 4 && currentBatch <= lastUnpaidQueue + 1) {
            while (currentHead != 0 && counter < 4) {
                QueueEntry storage entry = queueByBatch[currentBatch][
                    currentHead
                ];
                uint256 batchPrice = BTCACollection.getBatchPrice(
                    entry.batchLevel
                ) * 10 ** 6;
                uint256 maxClaim = (batchPrice * 3) - entry.dollarsClaimed;
                uint256 totalToClaim = (maxClaim * 1e18) / tokenPrice;

                totalRequiredBalance += totalToClaim;

                currentHead = queueByBatch[currentBatch][currentHead].next;
                counter++;
            }

            if (counter < 4) {
                currentBatch++;
                currentHead = headByBatch[currentBatch];
            }
        }

        return totalRequiredBalance;
    }

    function processPaymentForIndex(
        uint256 current,
        uint256 tokenPrice
    ) internal {
        QueueEntry storage entry = queueByBatch[lastUnpaidQueue][current];
        uint256 batchPrice = BTCACollection.getBatchPrice(entry.batchLevel) *
            10 ** 6;
        uint256 maxClaim = (batchPrice * 3) - entry.dollarsClaimed;

        uint256 totalToClaim = (maxClaim * 1e18) / tokenPrice;

        uint256 payableAmount = totalToClaim > balanceFree
            ? balanceFree
            : totalToClaim;

        balanceFree -= payableAmount;

        tokensToWithdraw[entry.user] += payableAmount;

        if (payableAmount == totalToClaim) {
            removeFromQueue(current, lastUnpaidQueue);
        }

        entry.dollarsClaimed += (payableAmount * tokenPrice) / 1e18;
    }

    function removeFromQueue(uint256 index, uint queueId) internal {
        QueueEntry storage entry = queueByBatch[queueId][index];

        if (entry.prev != 0) {
            queueByBatch[queueId][entry.prev].next = entry.next;
        } else {
            headByBatch[queueId] = entry.next;
        }

        if (entry.next != 0) {
            queueByBatch[queueId][entry.next].prev = entry.prev;
        } else {
            tailByBatch[queueId] = entry.prev;
        }

        queueSizeByBatch[queueId]--;
        totalNFTsInQueue--;

        if (
            queueSizeByBatch[queueId] == 0 && queueSizeByBatch[queueId + 1] > 0
        ) {
            ++lastUnpaidQueue;
        }

        delete queueByBatch[queueId][index];
    }

    function getQueueDetails(
        uint256 batchLevel
    ) external view returns (QueueEntry[] memory) {
        QueueEntry[] memory queueDetails = new QueueEntry[](
            queueSizeByBatch[batchLevel]
        );
        uint256 actual = headByBatch[batchLevel];
        uint256 i = 0;

        while (actual != 0) {
            queueDetails[i] = queueByBatch[batchLevel][actual];
            queueDetails[i].index = actual;
            actual = queueByBatch[batchLevel][actual].next;
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

    function getIndicesByBatchLevel(
        uint256 batchLevel
    ) external view returns (uint256[] memory) {
        uint256 queueSize = queueSizeByBatch[batchLevel];
        uint256[] memory indices = new uint256[](queueSize);
        uint256 current = headByBatch[batchLevel];
        uint256 i = 0;

        while (current != 0) {
            indices[i] = current;
            current = queueByBatch[batchLevel][current].next;
            i++;
        }

        return indices;
    }
}
