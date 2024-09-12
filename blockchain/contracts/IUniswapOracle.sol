// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IUniswapOracle {
    function estimateAmountOut(
        uint128 amountIn
    ) external view returns (uint amountOut);

    function returnPrice() external view returns (uint);
}
