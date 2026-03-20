// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interface/ITimeLock.sol";
import "./interface/ILido.sol";
import "./errors/TimeLockErrors.sol";

contract TimeLock is ITimeLock, Ownable, ReentrancyGuard {
    ILido public immutable lido;
    address public relayer;

    uint256 public feePercentage = 300;
    uint256 public interestRatePerSecond = 1_585_489_599;
    uint256 public totalDeposited;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTimes;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => uint256) public pendingInterest;
    mapping(address => uint256) public gasAdvanced;
    mapping(address => bool) public acceptedDisclaimer;

    uint256 private constant MAX_RATE = 7_927_447_995;
    uint256 private constant PRECISION = 1e18;

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert TimeLock__NotRelayer();
        _;
    }

    constructor(address _lido) Ownable(msg.sender) {
        lido = ILido(_lido);
        relayer = msg.sender;
    }

    function _updateReward(address _user) internal {
        if (lastUpdateTime[_user] != 0 && balances[_user] > 0) {
            uint256 ethAmount = lido.getPooledEthByShares(balances[_user]);
            pendingInterest[_user] +=
                (ethAmount * interestRatePerSecond * (block.timestamp - lastUpdateTime[_user])) / PRECISION;
        }
        lastUpdateTime[_user] = block.timestamp;
    }

    function deposit(uint256 _unlockTime) external payable {
        if (msg.value == 0) revert TimeLock__ZeroAmount();
        if (_unlockTime <= block.timestamp) revert TimeLock__InvalidUnlockTime();
        if (_unlockTime < unlockTimes[msg.sender]) revert TimeLock__CannotShortenDuration();

        _updateReward(msg.sender);

        uint256 shares = lido.submit{value: msg.value}(address(0));
        balances[msg.sender] += shares;
        unlockTimes[msg.sender] = _unlockTime;
        totalDeposited += shares;

        emit Deposited(msg.sender, msg.value, _unlockTime);
    }

    function withdraw() external nonReentrant {
        if (!acceptedDisclaimer[msg.sender]) revert TimeLock__DisclaimerNotAccepted();

        uint256 shares = balances[msg.sender];
        if (shares == 0) revert TimeLock__NoBalance();
        if (block.timestamp < unlockTimes[msg.sender]) revert TimeLock__Locked();

        _updateReward(msg.sender);

        uint256 ethFromLido = lido.redeem(shares);
        uint256 interest = pendingInterest[msg.sender];
        uint256 advanced = gasAdvanced[msg.sender];
        uint256 fee = (ethFromLido * feePercentage) / 10000;

        uint256 gross = ethFromLido + interest;
        uint256 deductions = advanced + fee;
        if (gross <= deductions) revert TimeLock__InsufficientBalance();
        uint256 netAmount = gross - deductions;

        balances[msg.sender] = 0;
        unlockTimes[msg.sender] = 0;
        totalDeposited -= shares;
        pendingInterest[msg.sender] = 0;
        gasAdvanced[msg.sender] = 0;

        (bool successOwner,) = payable(owner()).call{value: fee}("");
        if (!successOwner) revert TimeLock__TransferFailed();

        (bool successUser,) = payable(msg.sender).call{value: netAmount}("");
        if (!successUser) revert TimeLock__TransferFailed();

        emit Withdraw(msg.sender, netAmount, fee);
    }

    function claimInterest() external nonReentrant {
        _updateReward(msg.sender);

        uint256 reward = pendingInterest[msg.sender];
        if (reward == 0) revert TimeLock__NoReward();
        if (address(this).balance < reward) revert TimeLock__InsufficientReserve();

        pendingInterest[msg.sender] = 0;

        (bool success,) = payable(msg.sender).call{value: reward}("");
        if (!success) revert TimeLock__TransferFailed();

        emit InterestClaimed(msg.sender, reward);
    }

    function acceptDisclaimer() external {
        acceptedDisclaimer[msg.sender] = true;
        emit DisclaimerAccepted(msg.sender);
    }

    function recordGasAdvance(address _user, uint256 _amount) external onlyRelayer {
        gasAdvanced[_user] += _amount;
        emit GasAdvanceRecorded(_user, _amount);
    }

    function snapshotInterest(address[] calldata _users) external onlyRelayer {
        for (uint256 i = 0; i < _users.length; i++) {
            _updateReward(_users[i]);
            emit DailyInterestSnapshot(_users[i], pendingInterest[_users[i]], block.timestamp);
        }
    }

    function fundReserve() external payable onlyOwner {
        emit ReserveFunded(msg.sender, msg.value);
    }

    function setFeePercentage(uint256 _newFee) external override onlyOwner {
        if (_newFee > 1000) revert TimeLock__InvalidFee();
        uint256 oldFee = feePercentage;
        feePercentage = _newFee;
        emit FeeUpdated(oldFee, _newFee);
    }

    function setInterestRate(uint256 _newRate) external onlyOwner {
        if (_newRate > MAX_RATE) revert TimeLock__InvalidRate();
        uint256 oldRate = interestRatePerSecond;
        interestRatePerSecond = _newRate;
        emit InterestRateUpdated(oldRate, _newRate);
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    function pendingReward(address _user) external view returns (uint256) {
        if (lastUpdateTime[_user] == 0 || balances[_user] == 0) {
            return pendingInterest[_user];
        }
        uint256 ethAmount = lido.getPooledEthByShares(balances[_user]);
        return pendingInterest[_user]
            + (ethAmount * interestRatePerSecond * (block.timestamp - lastUpdateTime[_user])) / PRECISION;
    }

    function getLockInfo(address _user) external view returns (uint256 balance, uint256 unlockTime) {
        uint256 shares = balances[_user];
        uint256 ethAmount = shares > 0 ? lido.getPooledEthByShares(shares) : 0;
        return (ethAmount, unlockTimes[_user]);
    }

    function stEthShares(address _user) external view returns (uint256) {
        return balances[_user];
    }

    receive() external payable {}
}
