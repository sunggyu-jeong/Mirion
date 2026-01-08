// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "forge-std/console.sol";
import "./interface/ITimeLock.sol";
import "./errors/TimeLockErrors.sol";

contract TimeLock is ITimeLock, Ownable, ReentrancyGuard {
    // 서비스 이용 수수료 (e.g., 300 = 3%)
    uint256 public feePercentage = 300;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTimes;

    constructor() Ownable(msg.sender) {
        console.log("TimeLock contract deployed by:", msg.sender);
    }

    function deposit(uint256 _unlockTime) external payable {
        console.log("Deposit attempt by:", msg.sender, msg.value);
        if (msg.value == 0) revert TimeLock__ZeroAmount();
        if (_unlockTime <= block.timestamp) revert TimeLock__InvalidUnlockTime();
        if (_unlockTime < unlockTimes[msg.sender]) revert TimeLock__CannotShortenDuration();

        balances[msg.sender] += msg.value;
        unlockTimes[msg.sender] = _unlockTime;

        emit Deposited(msg.sender, msg.value, _unlockTime);
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];

        console.log("Withdraw attempt by %s, Current Balance: %e", msg.sender, amount);
        if (amount == 0) revert TimeLock__NoBalance();
        if (block.timestamp < unlockTimes[msg.sender]) revert TimeLock__Locked();

        uint256 fee = (amount * feePercentage) / 10000;
        uint256 amountAfterFee = amount - fee;

        balances[msg.sender] = 0;
        unlockTimes[msg.sender] = 0;

        console.log("Withdrawing %e to %s after fee %e", amountAfterFee, msg.sender, fee);
        (bool successOwner, ) = payable(owner()).call{value: fee}("");
        if (!successOwner) revert TimeLock__TransferFailed();

        (bool successUser, ) = payable(msg.sender).call{value: amountAfterFee}("");
        if (!successUser) revert TimeLock__TransferFailed();

        emit Withdraw(msg.sender, amountAfterFee, fee);    
    }

    function setFeePercentage(uint256 _newFee) external override onlyOwner {
        if (_newFee > 1000) revert TimeLock__InvalidFee();
        uint256 oldFee = feePercentage;
        feePercentage = _newFee;
        
        console.log("Fee updated from %s to %s", oldFee, _newFee);
        emit FeeUpdated(oldFee, _newFee);
    }

    function getLockInfo(address _user) external view returns (uint256 balance, uint256) {
        return (balances[_user], unlockTimes[_user]);
    }
}