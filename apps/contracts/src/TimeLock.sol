// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "forge-std/console.sol";
import "./interface/ITimeLock.sol";
import "./errors/TimeLockErrors.sol";

contract TimeLock is ITimeLock, Ownable, ReentrancyGuard {
    uint256 public feePercentage = 300;
    uint256 public interestRatePerSecond = 1_585_489_599;
    uint256 public totalDeposited;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTimes;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public pendingInterest;

    uint256 private constant MAX_RATE = 7_927_447_995;
    uint256 private constant PRECISION = 1e18;

    constructor() Ownable(msg.sender) {
        console.log("TimeLock contract deployed by:", msg.sender);
    }

    function _updateReward(address _user) internal {
        if (lastUpdateTime[_user] != 0 && balances[_user] > 0) {
            pendingInterest[_user] +=
                (balances[_user] * interestRatePerSecond * (block.timestamp - lastUpdateTime[_user])) / PRECISION;
        }
        lastUpdateTime[_user] = block.timestamp;
    }

    function deposit(uint256 _unlockTime) external payable {
        console.log("Deposit attempt by:", msg.sender, msg.value);
        if (msg.value == 0) revert TimeLock__ZeroAmount();
        if (_unlockTime <= block.timestamp) revert TimeLock__InvalidUnlockTime();
        if (_unlockTime < unlockTimes[msg.sender]) revert TimeLock__CannotShortenDuration();

        _updateReward(msg.sender);

        balances[msg.sender] += msg.value;
        unlockTimes[msg.sender] = _unlockTime;
        totalDeposited += msg.value;

        emit Deposited(msg.sender, msg.value, _unlockTime);
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];

        console.log("Withdraw attempt by %s, Current Balance: %e", msg.sender, amount);
        if (amount == 0) revert TimeLock__NoBalance();
        if (block.timestamp < unlockTimes[msg.sender]) revert TimeLock__Locked();

        _updateReward(msg.sender);

        uint256 fee = (amount * feePercentage) / 10000;
        uint256 amountAfterFee = amount - fee;

        balances[msg.sender] = 0;
        unlockTimes[msg.sender] = 0;
        totalDeposited -= amount;

        console.log("Withdrawing %e to %s after fee %e", amountAfterFee, msg.sender, fee);
        (bool successOwner,) = payable(owner()).call{value: fee}("");
        if (!successOwner) revert TimeLock__TransferFailed();

        (bool successUser,) = payable(msg.sender).call{value: amountAfterFee}("");
        if (!successUser) revert TimeLock__TransferFailed();

        emit Withdraw(msg.sender, amountAfterFee, fee);
    }

    function claimInterest() external nonReentrant {
        _updateReward(msg.sender);

        uint256 reward = pendingInterest[msg.sender];
        if (reward == 0) revert TimeLock__NoReward();
        if (address(this).balance - totalDeposited < reward) revert TimeLock__InsufficientReserve();

        pendingInterest[msg.sender] = 0;

        (bool success,) = payable(msg.sender).call{value: reward}("");
        if (!success) revert TimeLock__TransferFailed();

        emit InterestClaimed(msg.sender, reward);
    }

    function fundReserve() external payable onlyOwner {
        emit ReserveFunded(msg.sender, msg.value);
    }

    function setFeePercentage(uint256 _newFee) external override onlyOwner {
        if (_newFee > 1000) revert TimeLock__InvalidFee();
        uint256 oldFee = feePercentage;
        feePercentage = _newFee;

        console.log("Fee updated from %s to %s", oldFee, _newFee);
        emit FeeUpdated(oldFee, _newFee);
    }

    function setInterestRate(uint256 _newRate) external onlyOwner {
        if (_newRate > MAX_RATE) revert TimeLock__InvalidRate();
        uint256 oldRate = interestRatePerSecond;
        interestRatePerSecond = _newRate;
        emit InterestRateUpdated(oldRate, _newRate);
    }

    function pendingReward(address _user) external view returns (uint256) {
        if (lastUpdateTime[_user] == 0 || balances[_user] == 0) {
            return pendingInterest[_user];
        }
        return pendingInterest[_user]
            + (balances[_user] * interestRatePerSecond * (block.timestamp - lastUpdateTime[_user])) / PRECISION;
    }

    function getLockInfo(address _user) external view returns (uint256 balance, uint256) {
        return (balances[_user], unlockTimes[_user]);
    }
}
