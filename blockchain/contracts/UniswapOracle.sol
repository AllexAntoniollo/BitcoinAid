// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

contract UniswapOracle {
    address public poolBtcaUsdt;
    address public owner;
    address public btca;
    address public usdt;

    event OwnerChanged(address indexed previousOwner, address indexed newOwner);
    event UsdtSet(address indexed usdtAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerChanged(address(0), owner);
    }

    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerChanged(oldOwner, newOwner);
    }

    function setBtca(address _btca) external onlyOwner {
        require(_btca != address(0), "BTCA cannot be the zero address");
        btca = _btca;
    }

    function setUsdt(address _usdt) external onlyOwner {
        require(_usdt != address(0), "USDT cannot be the zero address");
        usdt = _usdt;
        emit UsdtSet(_usdt);
    }

    function setPoolBtcaUsdt(uint24 _fee) external onlyOwner {
        require(btca != address(0), "BTCA address not set");
        require(usdt != address(0), "USDT address not set");

        address _pool = IUniswapV3Factory(
            0x1F98431c8aD98523631AE4a59f267346ea31F984
        ).getPool(btca, usdt, _fee);
        require(_pool != address(0), "Pool does not exist");

        poolBtcaUsdt = _pool;
    }

    function returnPrice(uint128 amountIn) external view returns (uint) {
        require(poolBtcaUsdt != address(0), "BTCA/USDT pool not set");

        (int24 tickBtcaUsdt, ) = OracleLibrary.consult(poolBtcaUsdt, 10);
        uint amountOut = OracleLibrary.getQuoteAtTick(
            tickBtcaUsdt,
            amountIn,
            btca,
            usdt
        );
        return amountOut;
    }
}
