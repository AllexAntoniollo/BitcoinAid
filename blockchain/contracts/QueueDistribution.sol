// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./IBTCACollection.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./IUniswapOracle.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QueueDistribution is ERC1155Holder, Ownable {
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
    address donation;
    IERC20 token;

    mapping(address => uint256) public tokensToWithdraw;

    IUniswapOracle public uniswapOracle;

    constructor(
        address _collection,
        address _token,
        address _oracle,
        address initialOwner
    ) Ownable(initialOwner) {
        BTCACollection = IBTCACollection(_collection);
        token = IERC20(_token);
        currentIndex = 1;
        uniswapOracle = IUniswapOracle(_oracle);
    }

    function setDonationContract(address _donation) external onlyOwner {
        donation = _donation;
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

    function incrementBalance(uint amount) external onlyDonation {
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
        uint256 currentTail;
        bool foundClaimedEntry = false;
        bool swap = false;

        while (queueSizeByBatch[lastUnpaidQueue] > 0 && balanceFree > 0) {
            require(totalNFTsInQueue >= 4, "Minimum 4 nfts to claim prizes");

            if (headByBatch[lastUnpaidQueue] != index) {
                processPaymentForIndex(
                    headByBatch[lastUnpaidQueue],
                    tokenPrice
                );
            } else {
                if (queueSizeByBatch[lastUnpaidQueue] <= 3) {
                    swap = true;
                    processPaymentForIndex(
                        headByBatch[lastUnpaidQueue],
                        tokenPrice
                    );
                }
                foundClaimedEntry = true;
            }
            currentTail = tailByBatch[lastUnpaidQueue];
            if (tailByBatch[lastUnpaidQueue] != index) {
                processPaymentForIndex(
                    tailByBatch[lastUnpaidQueue],
                    tokenPrice
                );
            } else {
                if (queueSizeByBatch[lastUnpaidQueue] <= 2) {
                    swap = true;
                    processPaymentForIndex(
                        tailByBatch[lastUnpaidQueue],
                        tokenPrice
                    );
                }
                foundClaimedEntry = true;
            }
            if (headByBatch[lastUnpaidQueue] == currentHead) {
                processPaymentForIndex(
                    queueByBatch[lastUnpaidQueue][currentHead].next,
                    tokenPrice
                );
            } else {
                if (headByBatch[lastUnpaidQueue] != index) {
                    processPaymentForIndex(
                        headByBatch[lastUnpaidQueue],
                        tokenPrice
                    );
                } else {
                    if (queueSizeByBatch[lastUnpaidQueue] <= 1) {
                        swap = true;
                        processPaymentForIndex(
                            headByBatch[lastUnpaidQueue],
                            tokenPrice
                        );
                    }
                    foundClaimedEntry = true;
                }
            }

            if (tailByBatch[lastUnpaidQueue] == currentTail) {
                processPaymentForIndex(
                    queueByBatch[lastUnpaidQueue][currentTail].prev,
                    tokenPrice
                );
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
        if (!swap) {
            processPaymentForIndex(index, tokenPrice);
        }

        token.safeTransfer(msg.sender, tokensToWithdraw[msg.sender]);
        tokensToWithdraw[msg.sender] = 0;
    }

    function getRequiredBalanceForNextFour() public view returns (uint256) {
        uint256 tokenPrice = uniswapOracle.returnPrice();
        uint256 totalRequiredBalance = 0;
        uint256 counter = 0;
        uint256 currentBatch = lastUnpaidQueue;
        uint256 currentHead = headByBatch[currentBatch];

        while (counter < 4) {
            while (
                queueSizeByBatch[currentBatch] == 0 &&
                currentBatch <= currentIndex
            ) {
                ++currentBatch;
            }
            if (currentBatch >= 100) {
                uint actual = BTCACollection.getCurrentBatch();
                uint actualPrice = BTCACollection.getBatchPrice(actual) *
                    10 ** 6;

                uint faltantes = 4 - counter;
                uint totalPriceForFaltantes = actualPrice * faltantes * 3;

                uint256 totalToClaim = (totalPriceForFaltantes * 1e18) /
                    tokenPrice;
                totalRequiredBalance += totalToClaim;

                return totalRequiredBalance;
            }
            currentHead = headByBatch[currentBatch];
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

            currentBatch++;
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

        if (queueSizeByBatch[queueId] == 0) {
            while (
                queueSizeByBatch[queueId + 1] == 0 &&
                queueId + 1 <= currentIndex
            ) {
                queueId++;
            }
            if (queueSizeByBatch[queueId + 1] > 0) {
                lastUnpaidQueue = queueId + 1;
            }
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

    modifier onlyDonation() {
        require(
            donation == msg.sender,
            "Only the donation contract can call this function."
        );
        _;
    }
}
