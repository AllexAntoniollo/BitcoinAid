// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Tournament is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public rewardToken;

    struct Balance {
        uint256 token24;
        uint256 token30;
    }

    Balance public balances;

    struct Withdrawal {
        uint256 amount;
        uint256 expiresAt;
    }

    mapping(address => Withdrawal) public withdrawals;
    address[] private usersWithBalance;

    event FundsAllocated(
        address indexed wallet,
        uint256 amount,
        uint256 expiresAt
    );
    event Withdrawn(address indexed wallet, uint256 amount);
    event TournamentPaid(uint256 tournamentType, uint256 totalAmount);
    event ExpiredFundsCollected(address indexed wallet, uint256 amount);

    constructor(
        address initialOwner,
        address tokenAddress
    ) Ownable(initialOwner) {
        rewardToken = IERC20(tokenAddress);
    }

    function distributeFunds(
        address[] memory wallets,
        uint256 tournamentType
    ) external onlyOwner {
        uint256 totalAmount = tournamentType == 24
            ? balances.token24
            : balances.token30;

        uint8[5] memory percentages = [45, 25, 15, 10, 5];

        for (uint256 i = 0; i < wallets.length; i++) {
            uint256 amount = (totalAmount * percentages[i]) / 100;

            withdrawals[wallets[i]].amount += amount;
            withdrawals[wallets[i]].expiresAt = block.timestamp + 2 days;

            if (!_isUserStored(wallets[i])) {
                usersWithBalance.push(wallets[i]);
            }

            emit FundsAllocated(wallets[i], amount, block.timestamp + 2 days);
        }

        if (tournamentType == 24) {
            balances.token24 = 0;
        } else {
            balances.token30 = 0;
        }

        emit TournamentPaid(tournamentType, totalAmount);
    }

    function withdraw() external nonReentrant {
        Withdrawal memory userWithdrawal = withdrawals[msg.sender];
        require(userWithdrawal.amount > 0, "No funds available for withdrawal");
        require(
            block.timestamp <= userWithdrawal.expiresAt,
            "Withdrawal period expired"
        );

        uint256 amount = userWithdrawal.amount;
        withdrawals[msg.sender].amount = 0;
        withdrawals[msg.sender].expiresAt = 0;

        rewardToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        rewardToken.safeTransferFrom(msg.sender, address(this), amount);

        uint256 halfAmount = amount / 2;

        balances.token24 += halfAmount;
        balances.token30 += halfAmount;
    }

    function getExpiredUsers() external view returns (address[] memory) {
        uint256 count;
        for (uint256 i = 0; i < usersWithBalance.length; i++) {
            if (
                withdrawals[usersWithBalance[i]].amount > 0 &&
                block.timestamp > withdrawals[usersWithBalance[i]].expiresAt
            ) {
                count++;
            }
        }

        address[] memory expiredUsers = new address[](count);
        uint256 index;

        for (uint256 i = 0; i < usersWithBalance.length; i++) {
            if (
                withdrawals[usersWithBalance[i]].amount > 0 &&
                block.timestamp > withdrawals[usersWithBalance[i]].expiresAt
            ) {
                expiredUsers[index] = usersWithBalance[i];
                index++;
            }
        }

        return expiredUsers;
    }

    function collectExpiredFunds(address user) external onlyOwner nonReentrant {
        Withdrawal memory userWithdrawal = withdrawals[user];
        require(userWithdrawal.amount > 0, "No expired funds available");
        require(
            block.timestamp > userWithdrawal.expiresAt,
            "Funds are not expired"
        );

        uint256 amount = userWithdrawal.amount;
        withdrawals[user].amount = 0;
        withdrawals[user].expiresAt = 0;

        rewardToken.safeTransfer(owner(), amount);

        emit ExpiredFundsCollected(user, amount);
    }

    function _isUserStored(address user) internal view returns (bool) {
        for (uint256 i = 0; i < usersWithBalance.length; i++) {
            if (usersWithBalance[i] == user) {
                return true;
            }
        }
        return false;
    }
}
