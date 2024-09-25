// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

pragma solidity ^0.8.24;

interface IBTCACollection is IERC1155 {
    function getCurrentBatch() external view returns (uint);

    function getBatchPrice(uint batch) external view returns (uint256);

    function mint(uint256 amount) external;
}
