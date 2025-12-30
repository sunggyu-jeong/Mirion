// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/util/ReentrancyGuard.sol";

error TimeLock__ZeroAmount();
error TimeLock__InvalidUnlockTime();
error TimeLock__CannotShortenDuration();
error TimeLock__Locked();
error TimeLock__NoBalance();
error TimeLock__TransferFailed();
error TimeLock__InvalidFee();

contract TimeLock is Ownable, ReentrancyGuard {
    uint256 public feePercentage = 300;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTimes;

    event Deposit(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdraw(address indexed user, uint256 amount, uint256 fee);
    event FeeUpdated(uint256 newFee);

    constructor() Ownable(msg.sender) {}

    function deposit(uint256 _unlockTime) external payable {
        if (msg.value == 0) revert TimeLock__ZeroAmount();
        if (_unlockTime <= block.timestamp) revert TimeLock__InvalidUnlockTime();
        if (_unlockTime < unlockTimes[msg.sender]) revert TimeLock__CannotShortenDuration();

        balances[msg.sender] += msg.value;
        unlockTimes[msg.sender] = _unlockTime;

        emit Deposit(msg.sender, msg.value, _unlockTime);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        if (amount == 0) revert TimeLock__NoBalance();
        if (block.timestamp < unlockTimes[msg.sender]) revert TimeLock__Locked();

        uint256 fee = (amount * feePercentage) / 10000;
        uint256 amountAfterFee = amount - fee;

        balances[msg.sender] = 0;
        unlockTimes[msg.sender] = 0;

        (bool successOwner, ) = payable(owner()).call{value: fee}("");
        if (!successOwner) revert TimeLock__TransferFailed();

        (bool successUser, ) = payable(msg.sender).call{value: amountAfterFee}("");
        if (!successUser) revert TimeLock__TransferFailed();

        emit Withdraw(msg.sender, amountAfterFee, fee);    
    }

    function setFeePercentage(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert TimeLock__InvalidFee();
        feePercentage = _newFee;
        emit FeeUpdated(_newFee);
    }

    function getLockInfo(address _user) external view returns (uint256 balance, uint256) {
        return (balances[_user], unlockTimes[_user]);
    }
}