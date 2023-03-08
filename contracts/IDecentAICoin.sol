// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface IDecentAICoin{
    function mint(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}