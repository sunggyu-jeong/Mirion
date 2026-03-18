// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface ITimeLock {
  event Deposited(address indexed user, uint256 amount, uint256 unlockTime);
  event Withdraw(address indexed user, uint256 amount, uint256 fee);
  event FeeUpdated(uint256 indexed oldFee, uint256 indexed newFee);
  event InterestClaimed(address indexed user, uint256 amount);
  event InterestRateUpdated(uint256 oldRate, uint256 newRate);
  event ReserveFunded(address indexed funder, uint256 amount);

  function deposit(uint256 _unlockTime) external payable;
  function withdraw() external;
  function claimInterest() external;
  function fundReserve() external payable;
  function setFeePercentage(uint256 _newFee) external;
  function setInterestRate(uint256 _newRate) external;
  function getLockInfo(address _user) external view returns (uint256 balance, uint256 unlockTime);
  function pendingReward(address _user) external view returns (uint256);
}