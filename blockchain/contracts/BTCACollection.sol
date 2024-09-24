// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./IPaymentManager.sol";

contract BTCACollection is ERC1155, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint public currentBatch = 1;
    uint public totalMintedInBatch = 0;
    uint public constant batchSize = 100;
    IPaymentManager public paymentManager;
    IPaymentManager public reservePools;
    IPaymentManager public reserveBtca;
    event PaymentManagerUpdated(
        address indexed previousPaymentManager,
        address indexed newPaymentManager
    );
    event ReservePoolsUpdated(
        address indexed previousReservePools,
        address indexed newReservePools
    );
    event ReserveBtcaUpdated(
        address indexed previousReserveBtca,
        address indexed newReserveBtca
    );

    constructor(
        address initialOwner,
        address _token,
        address _paymentManager
    ) ERC1155("URI") Ownable(initialOwner) {
        token = IERC20(_token);
        paymentManager = IPaymentManager(_paymentManager);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function setPaymentManager(address _paymentManager) external onlyOwner {
        emit PaymentManagerUpdated(address(paymentManager), _paymentManager);
        paymentManager = IPaymentManager(_paymentManager);
    }

    function setReservePools(address _reservePools) external onlyOwner {
        emit ReservePoolsUpdated(address(reservePools), _reservePools);
        reservePools = IPaymentManager(_reservePools);
    }

    function setReserveBtca(address _reserveBtca) external onlyOwner {
        emit ReserveBtcaUpdated(address(reserveBtca), _reserveBtca);
        reserveBtca = IPaymentManager(_reserveBtca);
    }

    function getCurrentBatch() public view returns (uint) {
        return currentBatch;
    }

    function getBatchPrice(uint batch) public pure returns (uint256) {
        uint effectiveBatch = batch % 10 == 0 ? 10 : batch % 10;
        return 10 * (2 ** (effectiveBatch - 1));
    }

    function getCurrentBatchPrice() public view returns (uint256) {
        return getBatchPrice(currentBatch);
    }

    function mint(uint256 amount) public nonReentrant {
        if (amount + totalMintedInBatch > batchSize) {
            amount = batchSize - totalMintedInBatch;
        }

        uint256 price = getCurrentBatchPrice();
        uint256 totalPrice = price * amount * 10 ** 6;
        uint batch = currentBatch;
        updateBatch(amount);
        _mint(msg.sender, batch, amount, "");

        token.safeTransferFrom(msg.sender, address(this), totalPrice);
        token.safeTransfer(address(paymentManager), totalPrice / 4);
        token.safeTransfer(address(reserveBtca), totalPrice / 4);
        token.safeTransfer(address(reservePools), totalPrice / 2);

        // Atualiza os saldos no sistema de pagamento
        paymentManager.incrementBalance(totalPrice / 4);
        reserveBtca.incrementBalance(totalPrice / 4);
        reservePools.incrementBalance(totalPrice / 2);
    }

    function updateBatch(uint256 amountMinted) internal {
        totalMintedInBatch += amountMinted;
        if (totalMintedInBatch >= batchSize) {
            totalMintedInBatch = 0;
            currentBatch++;
        }
    }
}
