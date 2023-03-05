// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

interface IDecentAINode {
    function safeMint(address to, string memory uri) external returns (uint256 tokenId);
}