// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IBurnable.sol";
import "hardhat/console.sol";

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

    uint24 public constant limitPeriod = 15 days;
    // IUniswapAidMut public uniswapOracle;

    IBurnable private immutable token;
    uint256 public distributionBalance;

    mapping(address => Donation.UserDonation) private users;

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IBurnable(_token);
    }

    function addDistributionFunds(uint256 amount) external onlyOwner {
        token.safeTransferFrom(msg.sender, address(this), amount);
        distributionBalance += (amount * 99) / 100;
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
        uint amountUsdt = amount;
        require(
            amountUsdt >= 10 ether,
            "Amount must be greater than 10 dollars"
        );
        uint totalPool = distributionBalance;

        users[msg.sender].balance = amount;
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

        uint totalValue = calculateTotalValue(msg.sender);
        require(
            distributionBalance >= totalValue,
            "Insufficient distribution balance"
        );

        distributionBalance -= totalValue;

        users[msg.sender].balance = 0;
        token.safeTransfer(msg.sender, (totalValue * 95) / 100);
        emit UserClaimed(msg.sender, totalValue);
    }

    function getUser(
        address _user
    ) external view returns (Donation.UserDonation memory) {
        Donation.UserDonation memory userDonation = users[_user];
        userDonation.balance = calculateTotalValue(_user);
        return userDonation;
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
