// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMultiCall.sol";

contract MultiCallLayer {
    IMultiCall public multicall;

    function setMulticallAddress(address _multicall) external {
        require(_multicall != address(0), "Invalid address");
        multicall = IMultiCall(_multicall);
    }

    function callAddOnQueue2() external {
        multicall.addOnQueue2();
    }

    function callAddOnQueue1() external {
        multicall.addOnQueue1();
    }
}
