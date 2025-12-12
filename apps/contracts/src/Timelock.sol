pragma solidity ^0.8.20;

error TimeLock__ZeroAmount();
error TimeLock__InvalidUnlockTime();
error TimeLock__CannotShortenDuration();
error TimeLock__Locked();
error TimeLock__NoBalance();
error TimeLock__TransferFailed();

contract TimeLock {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTimes;

    event Deposit(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdraw(address indexed user, uint256 amount);

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

        balances[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TimeLock__TransferFailed();

        emit Withdraw(msg.sender, amount);    
    }
}