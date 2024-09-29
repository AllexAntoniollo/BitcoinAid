// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentManager is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint public balanceFree;
    mapping(address => uint) private recipientsClaim;
    mapping(address => uint24) public recipientsPercentage;
    mapping(address => bool) public immutableWallets;
    address[] private recipients;
    uint8 public totalRecipients;
    uint24 public totalPercentage;
    address public donationContract;
    address public collectionContract;

    event Claim(uint256 amount);
    event DonationSet(address indexed donationAddress);
    event CollectionSet(address indexed collectionContract);
    event BalanceIncremented(uint256 amount);
    event RecipientAdded(address indexed newRecipient, uint24 percentage);
    event RecipientPercentageUpdated(
        address indexed recipient,
        uint24 newPercentage
    );
    event ImmutableWalletAdded(address indexed wallet);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);

        recipients.push(0x969D14769009375a0AD051a407C792bA3C2fC44E);
        recipientsPercentage[
            0x969D14769009375a0AD051a407C792bA3C2fC44E
        ] = 100000;
        totalPercentage += 100000;
        totalRecipients = 1;
        addImmutableWallet(0x969D14769009375a0AD051a407C792bA3C2fC44E);
    }

    function setDonation(address _donation) external onlyOwner {
        require(
            _donation != address(0),
            "Donation address cannot be zero address"
        );
        donationContract = _donation;
        emit DonationSet(_donation);
    }

    function setCollection(address _collection) external onlyOwner {
        require(
            _collection != address(0),
            "Collection address cannot be zero address"
        );
        collectionContract = _collection;
        emit CollectionSet(_collection);
    }

    modifier onlyContracts() {
        require(
            donationContract == msg.sender || collectionContract == msg.sender,
            "Only the donation contract or collection contract can call this function."
        );
        _;
    }

    function incrementBalance(uint amount) external onlyContracts {
        balanceFree += amount;
        emit BalanceIncremented(amount);
    }

    function replaceImmutableWallet(
        address oldWallet,
        address newWallet
    ) external {
        require(oldWallet == msg.sender, "You are not the owner");
        require(oldWallet != address(0), "Old wallet address cannot be zero");
        require(newWallet != address(0), "New wallet address cannot be zero");
        require(
            immutableWallets[oldWallet],
            "Old wallet is not an immutable wallet"
        );
        require(
            recipientsPercentage[newWallet] == 0,
            "New wallet is already a recipient"
        );

        uint24 oldPercentage = recipientsPercentage[oldWallet];

        recipients.push(newWallet);
        recipientsPercentage[newWallet] = oldPercentage;
        immutableWallets[newWallet] = true;

        _removeRecipient(oldWallet);

        immutableWallets[oldWallet] = false;

        emit RecipientAdded(newWallet, oldPercentage);
        emit ImmutableWalletAdded(newWallet);
    }

    function _removeRecipient(address recipient) internal {
        require(
            recipientsPercentage[recipient] > 0,
            "Recipient does not exist"
        );

        uint recipientIndex;
        for (uint i = 0; i < recipients.length; i++) {
            if (recipients[i] == recipient) {
                recipientIndex = i;
                break;
            }
        }

        totalPercentage -= recipientsPercentage[recipient];
        recipientsPercentage[recipient] = 0;

        recipients[recipientIndex] = recipients[recipients.length - 1];
        recipients.pop();
        totalRecipients--;
    }

    function getUserBalance(address _wallet) external view returns (uint256) {
        uint24 recipientPercentage = recipientsPercentage[_wallet];
        if (recipientPercentage == 0) {
            return recipientsClaim[_wallet];
        }

        uint256 userBalance = recipientsClaim[_wallet];
        uint24 aux = 1000000;
        for (uint256 index = 0; index < recipients.length; index++) {
            aux -= recipientsPercentage[recipients[index]];
        }

        userBalance += (balanceFree * recipientPercentage) / 1000000;

        return userBalance;
    }

    function claim() external {
        uint24 recipientPercentage = recipientsPercentage[msg.sender];
        require(recipientPercentage > 0, "You are not a registered recipient");
        if (balanceFree > 0) {
            uint24 aux = 1000000;
            for (uint256 index = 0; index < recipients.length; index++) {
                aux -= recipientsPercentage[recipients[index]];
                recipientsClaim[recipients[index]] +=
                    (balanceFree * recipientsPercentage[recipients[index]]) /
                    1000000;
            }
            balanceFree = (balanceFree * aux) / 1000000;
        }
        uint amount = recipientsClaim[msg.sender];

        recipientsClaim[msg.sender] = 0;
        emit Claim(amount);

        token.safeTransfer(msg.sender, amount);
    }

    function getRecipients() external view returns (address[] memory) {
        return recipients;
    }

    function addRecipient(
        address newRecipient,
        uint24 percentage
    ) external onlyOwner {
        require(newRecipient != address(0), "Recipient address cannot be zero");
        require(
            recipientsPercentage[newRecipient] == 0,
            "Recipient already exists"
        );
        require(
            totalPercentage + percentage <= 1000000,
            "Total percentage exceeds 100%"
        );

        recipients.push(newRecipient);
        recipientsPercentage[newRecipient] = percentage;
        totalPercentage += percentage;
        totalRecipients++;

        emit RecipientAdded(newRecipient, percentage);
    }

    function addImmutableWallet(address wallet) public onlyOwner {
        require(wallet != address(0), "Wallet address cannot be zero");
        require(
            recipientsPercentage[wallet] > 0,
            "Wallet must be a recipient to be made immutable"
        );
        immutableWallets[wallet] = true;
        emit ImmutableWalletAdded(wallet);
    }

    function updateRecipientPercentage(
        address recipient,
        uint24 newPercentage
    ) external onlyOwner {
        require(
            recipientsPercentage[recipient] > 0,
            "Recipient does not exist"
        );
        require(
            !immutableWallets[recipient],
            "This recipient is immutable and cannot have their percentage updated"
        );

        uint24 currentPercentage = recipientsPercentage[recipient];
        totalPercentage = totalPercentage - currentPercentage + newPercentage;
        require(totalPercentage <= 1000000, "Total percentage exceeds 100%");

        recipientsPercentage[recipient] = newPercentage;

        emit RecipientPercentageUpdated(recipient, newPercentage);
    }
}
