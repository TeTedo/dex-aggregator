// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BaseAdaptor} from "./adaptor/BaseAdaptor.sol";
import {Maintainable} from "./lib/Maintainable.sol";
import {IRouter} from "./interfaces/IRouter.sol";
import {Recoverable} from "./lib/Recoverable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract Router is IRouter, Maintainable, Recoverable {
    using SafeERC20 for IERC20;
    using Address for address;
    using EnumerableSet for EnumerableSet.AddressSet;
    using Math for uint256;
    
    EnumerableSet.AddressSet private _adaptors;
    uint256 public FEE_DENOMINATOR = 1e4;
    uint256 public fee;

    event FeeSent(address indexed token, uint256 amount);

    constructor(uint256 _fee) {
        fee = _fee;
    }

    function addAdaptor(address adaptor) public onlyMaintainer {
        _adaptors.add(adaptor);
    }

    function removeAdaptor(address adaptor) public onlyMaintainer {
        _adaptors.remove(adaptor);
    }

    function getAdaptors() public view returns (address[] memory) {
        return _adaptors.values();
    }

    function getQuoteWithNoSplit(address tokenIn, address tokenOut, uint256 amountIn) public view returns (uint256 bestAmountOut) {
        uint256 _amountIn = amountIn;
        uint256 _feeAmount = _amountIn.mulDiv(fee, FEE_DENOMINATOR);
        _amountIn = _amountIn - _feeAmount;
        for (uint256 i = 0; i < _adaptors.length(); i++) {
            address adaptor = _adaptors.at(i);
            uint256 _amountOut = BaseAdaptor(adaptor).getQuote(tokenIn, tokenOut, amountIn);
            if (_amountOut > bestAmountOut) {
                bestAmountOut = _amountOut;
            }
        }
    }

    function swapWithExactPathAndExactAdaptor(address[] calldata path, address[] calldata adaptors, uint256 amountIn) public returns (uint256 amountOut) {
        uint256 _amountIn = amountIn;
        uint256 _feeAmount = _amountIn.mulDiv(fee, FEE_DENOMINATOR);
        _amountIn = _amountIn - _feeAmount;
        uint256 _amountOut = 0;
        for (uint256 i = 0; i < adaptors.length; i++) {
            address adaptor = adaptors[i];
            _amountOut = BaseAdaptor(adaptor).swap(path[i], path[i + 1], _amountIn);
            _amountIn = _amountOut;
        }
        sendRouterFee(path[0], _feeAmount);
        return _amountOut - _feeAmount;
    }

    function sendRouterFee(address token, uint256 feeAmount) internal {
        IERC20(token).safeTransfer(msg.sender, feeAmount);
        emit FeeSent(token, feeAmount);
    }
}