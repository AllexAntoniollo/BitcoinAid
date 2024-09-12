// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBurnable.sol";
import "./IPaymentManager.sol";
import "hardhat/console.sol";
import "./IUniswapOracle.sol";

library Donation {
    struct UserDonation {
        uint balance;
        uint startedTimestamp;
        uint poolPaymentIndex;
        bool fifteenDays;
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

    mapping(address => Donation.UserDonation) private users;

    constructor(
        address _token,
        address initialOwner,
        address _paymentManager,
        address oracle
    ) Ownable(initialOwner) {
        token = IBurnable(_token);
        paymentManager = IPaymentManager(_paymentManager);
        uniswapOracle = IUniswapOracle(oracle);
    }

    function addDistributionFunds(uint256 amount) external onlyOwner {
        token.safeTransferFrom(msg.sender, address(this), amount);
        distributionBalance += (amount * 99) / 100;
    }

    function changeMinTime(uint24 time) external {
        limitPeriod = time;
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
        // uint amountUsdt = uniswapOracle.estimateAmountOut(amount);
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
        token.burn(amount / 5);
        // token.safeTransfer(msg.sender, (amount * 3) / 10);

        emit UserDonated(msg.sender, amount);
    }

    function claimDonation() external nonReentrant {
        Donation.UserDonation memory userDonation = users[msg.sender];
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

        paymentManager.incrementBalance(((totalTokensToSend / 20) * 99) / 100);
        token.safeTransfer(address(paymentManager), totalTokensToSend / 20);
        token.safeTransfer(msg.sender, (totalTokensToSend * 95) / 100);

        emit UserClaimed(msg.sender, totalTokensToSend);
    }

    function getUser(
        address _user
    ) external view returns (Donation.UserDonation memory) {
        Donation.UserDonation memory userDonation = users[_user];
        userDonation.balance = calculateTotalValue(_user);
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
                percentage = 100;
            } else if (userDonation.poolPaymentIndex == 1) {
                percentage = 80;
            } else if (userDonation.poolPaymentIndex == 2) {
                percentage = 60;
            } else if (userDonation.poolPaymentIndex == 3) {
                percentage = 40;
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
                    percentage = 100;
                } else if (userDonation.poolPaymentIndex == 1) {
                    percentage = 80;
                } else if (userDonation.poolPaymentIndex == 2) {
                    percentage = 60;
                } else if (userDonation.poolPaymentIndex == 3) {
                    percentage = 40;
                }
            }
        }

        balance =
            userDonation.balance +
            ((userDonation.balance * percentage) / 100);
    }
}
