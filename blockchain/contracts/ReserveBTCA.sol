// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ReserveBTCA is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public usdToken;

    uint256 public virtualBalance;

    address public collection;
    address public claimWallet;
    address public donation;
    event BalanceIncremented(uint256 amount);
    event ClaimedBTCA(address indexed user, uint256 amount);
    event CollectionSet(address indexed collectionAddress);
    event DonationSet(address indexed donationAddress);

    event ClaimWalletSet(address indexed newClaimWallet);

    constructor(IERC20 _usdToken, address initialOwner) Ownable(initialOwner) {
        usdToken = _usdToken;
    }

    function setClaimWallet(address _claimWallet) external onlyOwner {
        require(
            _claimWallet != address(0),
            "Claim wallet cannot be zero address"
        );
        claimWallet = _claimWallet;
        emit ClaimWalletSet(_claimWallet);
    }

    function setCollection(address _collection) external onlyOwner {
        require(
            _collection != address(0),
            "Collection address cannot be zero address"
        );
        collection = _collection;
        emit CollectionSet(_collection);
    }

    function setDonation(address _donation) external onlyOwner {
        require(
            _donation != address(0),
            "Donation address cannot be zero address"
        );
        donation = _donation;
        emit CollectionSet(_donation);
    }

    function incrementBalance(uint256 amount) external onlyCollection {
        virtualBalance += amount;
        emit BalanceIncremented(amount);
    }

    function collect() external onlyAuthorized {
        require(usdToken.balanceOf(address(this)) > 0, "Insufficient funds");
        usdToken.safeTransfer(msg.sender, usdToken.balanceOf(address(this)));
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == claimWallet,
            "Only the owner or authorized wallet can call this function."
        );
        _;
    }

    modifier onlyCollection() {
        require(
            collection == msg.sender || msg.sender == donation,
            "Only the collection contract or the donation contract can call this function."
        );
        _;
    }
}
