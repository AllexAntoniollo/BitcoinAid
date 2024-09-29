// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IUniswapOracle {
    function returnPrice(uint128 amountIn) external pure returns (uint);
}
