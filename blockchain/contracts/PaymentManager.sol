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
    address[] private recipients;
    uint8 public totalRecipients;
    uint24 public totalPercentage;
    address public donationContract;
    address public collectionContract;

    address[4] public fixedWallets = [
        0x1111111111111111111111111111111111111111,
        0x2222222222222222222222222222222222222222,
        0x3333333333333333333333333333333333333333,
        0x4444444444444444444444444444444444444444
    ];
    uint24 constant fixedWeight = 200000;

    event Claim(uint256 amount);
    event DonationSet(address indexed donationAddress);
    event CollectionSet(address indexed collectionContract);
    event BalanceIncremented(uint256 amount);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        token = IERC20(_token);

        for (uint8 i = 0; i < 4; i++) {
            recipients.push(fixedWallets[i]);
            recipientsPercentage[fixedWallets[i]] = fixedWeight;
            totalPercentage += fixedWeight;
        }

        recipients.push(owner());
        recipientsPercentage[owner()] = fixedWeight;
        totalPercentage += fixedWeight;

        totalRecipients = 5;
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
}
