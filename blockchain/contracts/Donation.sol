// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBurnable.sol";
import "./IPaymentManager.sol";
import "hardhat/console.sol";
import "./IUniswapOracle.sol";
import "./IQueueDistribution.sol";

library Donation {
    struct UserDonation {
        uint balance;
        uint startedTimestamp;
        uint poolPaymentIndex;
        bool fifteenDays;
        uint totalClaimed;
    }
}

contract DonationBTCA is ReentrancyGuard, Ownable {
    using SafeERC20 for IBurnable;

    event UserDonated(address indexed user, uint amount);
    event UserClaimed(address indexed user, uint amount);

    uint24 public limitPeriod = 15 days;

    IUniswapOracle public uniswapOracle;
    IBurnable private immutable token;

    uint256 public distributionBalance;
    IPaymentManager public paymentManager;
    IQueueDistribution public queueDistribution;

    uint256 public totalBurned;
    uint256 public totalDistributedForUsers;
    uint256 public totalForDevelopment;
    uint256 public totalPaidToUsers;
    uint public nextPoolFilling;

    mapping(address => Donation.UserDonation) private users;

    constructor(
        address _token,
        address initialOwner,
        address _paymentManager,
        address oracle,
        address queue
    ) Ownable(initialOwner) {
        token = IBurnable(_token);
        paymentManager = IPaymentManager(_paymentManager);
        uniswapOracle = IUniswapOracle(oracle);
        queueDistribution = IQueueDistribution(queue);
    }

    function addDistributionFunds(uint256 amount) external onlyOwner {
        token.safeTransferFrom(msg.sender, address(this), amount);
        distributionBalance += (amount * 99) / 100;
    }

    function changeMinTime(uint24 time) external {
        limitPeriod = time;
    }

    function setQueue(address _queue) external onlyOwner {
        queueDistribution = IQueueDistribution(_queue);
    }

    function timeUntilNextWithdrawal(
        address user
    ) external view returns (uint256) {
        Donation.UserDonation memory userDonation = users[user];
        uint256 timeElapsed = block.timestamp - userDonation.startedTimestamp;
        uint256 withdrawalPeriod = userDonation.fifteenDays
            ? limitPeriod
            : limitPeriod * 2;

        if (timeElapsed < withdrawalPeriod) {
            return withdrawalPeriod - timeElapsed;
        } else {
            return 0;
        }
    }

    function donate(uint128 amount, bool fifteenDays) external nonReentrant {
        uint amountBurned = (amount * 99) / 100;
        uint amountUsdt = (uniswapOracle.returnPrice() * amount) / 1e18;

        require(amountUsdt >= 10e6, "Amount must be greater than 10 dollars");
        uint totalPool = distributionBalance;

        users[msg.sender].balance += amountUsdt;
        users[msg.sender].startedTimestamp = block.timestamp;
        users[msg.sender].fifteenDays = fifteenDays;
        users[msg.sender].poolPaymentIndex = (totalPool >= 15e8 ether)
            ? 0
            : (totalPool >= 1e9 ether)
            ? 1
            : (totalPool >= 5e8 ether)
            ? 2
            : 3;

        token.safeTransferFrom(msg.sender, address(this), amount);
        nextPoolFilling += amountBurned / 2;
        uint256 burnedAmount = amountBurned / 5;
        token.burn(burnedAmount);
        totalBurned += burnedAmount;

        uint256 distributedAmount = (amountBurned * 3) / 10;
        totalDistributedForUsers += distributedAmount;
        token.safeTransfer(address(queueDistribution), distributedAmount);
        queueDistribution.incrementBalance((distributedAmount * 99) / 100);
        emit UserDonated(msg.sender, amountBurned);
    }

    function refillPool() external onlyOwner {
        distributionBalance += nextPoolFilling;
        nextPoolFilling = 0;
    }

    function claimDonation() external nonReentrant {
        Donation.UserDonation storage userDonation = users[msg.sender];
        uint timeElapsed = block.timestamp - userDonation.startedTimestamp;

        if (userDonation.fifteenDays) {
            require(
                timeElapsed >= limitPeriod,
                "Tokens are still locked for 15 days"
            );
        } else {
            require(
                timeElapsed >= limitPeriod * 2,
                "Tokens are still locked for 30 days"
            );
        }

        uint totalValueInUSD = calculateTotalValue(msg.sender);
        require(
            distributionBalance >= totalValueInUSD,
            "Insufficient distribution balance"
        );

        uint currentPrice = uniswapOracle.returnPrice();
        uint totalTokensToSend = (totalValueInUSD * 1e18) / currentPrice;

        require(
            distributionBalance >= totalTokensToSend,
            "Insufficient token balance for distribution"
        );

        distributionBalance -= totalTokensToSend;

        users[msg.sender].balance = 0;

        uint256 paymentManagerAmount = (totalTokensToSend / 20);
        paymentManager.incrementBalance((paymentManagerAmount * 99) / 100);
        token.safeTransfer(address(paymentManager), paymentManagerAmount);
        totalForDevelopment += paymentManagerAmount;

        uint256 userAmount = (totalTokensToSend * 95) / 100;
        token.safeTransfer(msg.sender, userAmount);
        totalPaidToUsers += userAmount;

        userDonation.totalClaimed += totalValueInUSD;

        emit UserClaimed(msg.sender, totalTokensToSend);
    }

    function getUser(
        address _user
    ) external view returns (Donation.UserDonation memory) {
        Donation.UserDonation memory userDonation = users[_user];
        return userDonation;
    }

    function previewTotalValue(
        address user
    ) external view returns (uint balance) {
        Donation.UserDonation memory userDonation = users[user];
        uint percentage = 0;

        if (userDonation.fifteenDays) {
            if (userDonation.poolPaymentIndex == 0) {
                percentage = 50;
            } else if (userDonation.poolPaymentIndex == 1) {
                percentage = 40;
            } else if (userDonation.poolPaymentIndex == 2) {
                percentage = 30;
            } else if (userDonation.poolPaymentIndex == 3) {
                percentage = 20;
            }
        } else {
            if (userDonation.poolPaymentIndex == 0) {
                percentage = 130;
            } else if (userDonation.poolPaymentIndex == 1) {
                percentage = 110;
            } else if (userDonation.poolPaymentIndex == 2) {
                percentage = 90;
            } else if (userDonation.poolPaymentIndex == 3) {
                percentage = 70;
            }
        }

        balance =
            userDonation.balance +
            ((userDonation.balance * percentage) / 100);
    }

    function calculateTotalValue(
        address user
    ) internal view returns (uint balance) {
        Donation.UserDonation memory userDonation = users[user];
        uint timeElapsed = block.timestamp - userDonation.startedTimestamp;
        uint percentage = 0;

        if (userDonation.fifteenDays) {
            if (timeElapsed >= limitPeriod) {
                if (userDonation.poolPaymentIndex == 0) {
                    percentage = 50;
                } else if (userDonation.poolPaymentIndex == 1) {
                    percentage = 40;
                } else if (userDonation.poolPaymentIndex == 2) {
                    percentage = 30;
                } else if (userDonation.poolPaymentIndex == 3) {
                    percentage = 20;
                }
            }
        } else {
            if (timeElapsed >= limitPeriod * 2) {
                if (userDonation.poolPaymentIndex == 0) {
                    percentage = 130;
                } else if (userDonation.poolPaymentIndex == 1) {
                    percentage = 110;
                } else if (userDonation.poolPaymentIndex == 2) {
                    percentage = 90;
                } else if (userDonation.poolPaymentIndex == 3) {
                    percentage = 70;
                }
            }
        }

        balance =
            userDonation.balance +
            ((userDonation.balance * percentage) / 100);
    }
}
