// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseAdaptor} from "./BaseAdaptor.sol";

contract UniswapV2Adaptor is BaseAdaptor {
    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) public view override returns (uint256 amountOut) {
        return 0;
    }

    function swap(address tokenIn, address tokenOut, uint256 amountIn) public override returns (uint256 amountOut) {
        return 0;
    }
}