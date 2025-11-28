// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IRouter {
    function addAdaptor(address adaptor) external;
    function getAdaptors() external view returns (address[] memory);
    function removeAdaptor(address adaptor) external;
    function getQuoteWithNoSplit(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut);
    function swapWithExactPathAndExactAdaptor(address[] calldata path, address[] calldata adaptors, uint256 amountIn) external returns (uint256 amountOut);
}