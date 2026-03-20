// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ILido {
    function submit(address _referral) external payable returns (uint256 sharesAmount);
    function redeem(uint256 _sharesAmount) external returns (uint256 ethAmount);
    function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256);
    function getSharesByPooledEth(uint256 _ethAmount) external view returns (uint256);
}
