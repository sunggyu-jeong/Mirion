// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {TimeLock} from "../src/TimeLock.sol";
import {ITimeLock} from "../src/interface/ITimeLock.sol";
import {MockLido} from "../src/mocks/MockLido.sol";
import "../src/errors/TimeLockErrors.sol";

contract ReentrancyAttacker {
    TimeLock private target;
    bool private attacking;

    constructor(address _target) {
        target = TimeLock(payable(_target));
    }

    function deposit(uint256 _unlockTime) external payable {
        target.deposit{value: msg.value}(_unlockTime);
    }

    function attack() external {
        attacking = true;
        target.claimInterest();
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            target.claimInterest();
        }
    }
}

contract TimeLockInterestTest is Test {
    MockLido public mockLido;
    TimeLock public timeLock;
    address public user = makeAddr("user");
    uint256 public constant START_BALANCE = 100 ether;
    uint256 public constant RESERVE_FUND = 10 ether;

    function setUp() public {
        mockLido = new MockLido();
        timeLock = new TimeLock(address(mockLido));
        vm.deal(user, START_BALANCE);
        timeLock.fundReserve{value: RESERVE_FUND}();
    }

    function test_InterestMathematicalAccuracy() public {
        uint256 depositAmount = 1 ether;
        uint256 duration = 365 days;
        uint256 unlockTime = block.timestamp + duration;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.warp(block.timestamp + duration);

        uint256 expectedInterest = (depositAmount * timeLock.interestRatePerSecond() * duration) / 1e18;
        uint256 actualPending = timeLock.pendingReward(user);

        assertEq(actualPending, expectedInterest);
    }

    function test_ClaimInterest_TransfersCorrectAmount() public {
        uint256 depositAmount = 1 ether;
        uint256 duration = 365 days;
        uint256 unlockTime = block.timestamp + duration;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.warp(block.timestamp + duration);

        uint256 expectedInterest = (depositAmount * timeLock.interestRatePerSecond() * duration) / 1e18;
        uint256 balanceBefore = address(user).balance;

        vm.expectEmit(true, false, false, true);
        emit ITimeLock.InterestClaimed(user, expectedInterest);

        vm.prank(user);
        timeLock.claimInterest();

        assertEq(address(user).balance, balanceBefore + expectedInterest);
        assertEq(timeLock.pendingInterest(user), 0);
    }

    function test_ReentrancyAttackReverts() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(timeLock));
        vm.deal(address(attacker), 10 ether);

        uint256 unlockTime = block.timestamp + 1 days;
        attacker.deposit{value: 1 ether}(unlockTime);

        vm.warp(unlockTime + 1);

        vm.expectRevert(TimeLock__TransferFailed.selector);
        attacker.attack();
    }

    function test_ReentrancyAttack_StateUnchanged() public {
        ReentrancyAttacker attacker = new ReentrancyAttacker(address(timeLock));
        vm.deal(address(attacker), 10 ether);

        uint256 unlockTime = block.timestamp + 1 days;
        attacker.deposit{value: 1 ether}(unlockTime);

        vm.warp(unlockTime + 1);

        uint256 pendingBefore = timeLock.pendingReward(address(attacker));
        uint256 reserveBefore = address(timeLock).balance;

        try attacker.attack() {} catch {}

        uint256 reserveAfter = address(timeLock).balance;
        assertGe(reserveBefore - reserveAfter, 0);
        assertLe(reserveBefore - reserveAfter, pendingBefore);
    }

    function test_RevertIf_InsufficientReserve() public {
        MockLido freshMockLido = new MockLido();
        TimeLock freshLock = new TimeLock(address(freshMockLido));
        vm.deal(user, START_BALANCE);

        uint256 unlockTime = block.timestamp + 1 days;
        vm.prank(user);
        freshLock.deposit{value: 1 ether}(unlockTime);

        vm.warp(unlockTime + 1);

        vm.expectRevert(TimeLock__InsufficientReserve.selector);
        vm.prank(user);
        freshLock.claimInterest();
    }

    function test_RevertIf_NoReward() public {
        uint256 unlockTime = block.timestamp + 1 days;
        vm.prank(user);
        timeLock.deposit{value: 1 ether}(unlockTime);

        vm.expectRevert(TimeLock__NoReward.selector);
        vm.prank(user);
        timeLock.claimInterest();
    }

    function test_InterestAccumulates_AcrossMultipleDeposits() public {
        uint256 unlockTime = block.timestamp + 365 days;

        vm.prank(user);
        timeLock.deposit{value: 1 ether}(unlockTime);

        vm.warp(block.timestamp + 100 days);

        uint256 rate = timeLock.interestRatePerSecond();
        uint256 interestPhase1 = (1 ether * rate * 100 days) / 1e18;

        vm.prank(user);
        timeLock.deposit{value: 1 ether}(unlockTime);

        vm.warp(block.timestamp + 100 days);

        uint256 interestPhase2 = (2 ether * rate * 100 days) / 1e18;

        uint256 totalExpected = interestPhase1 + interestPhase2;
        assertEq(timeLock.pendingReward(user), totalExpected);
    }

    receive() external payable {}
}
