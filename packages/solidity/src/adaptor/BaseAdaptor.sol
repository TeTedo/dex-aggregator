// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract BaseAdaptor {
    function getQuote(address tokenIn, address tokenOut, uint256 amountIn) public view virtual returns (uint256 amountOut);
    function swap(address tokenIn, address tokenOut, uint256 amountIn) public virtual returns (uint256 amountOut);
}