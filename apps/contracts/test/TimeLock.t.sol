// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "forge-std/Test.sol";
import { TimeLock } from "../src/TimeLock.sol";
import { ITimeLock } from "../src/interface/ITimeLock.sol";
import { MockLido } from "../src/mocks/MockLido.sol";
import "../src/errors/TimeLockErrors.sol";

contract TimeLockTest is Test {

    MockLido public mockLido;
    TimeLock public timeLock;
    address public user = makeAddr("user");
    address public owner;
    uint256 public constant START_BALANCE = 100 ether;

    function setUp() public {
        owner = address(this);
        mockLido = new MockLido();
        timeLock = new TimeLock(address(mockLido));
        vm.deal(user, START_BALANCE);
    }

    function test_Deposit_Success() public {
        vm.startPrank(user);
        uint256 depositAmount = 1 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.expectEmit(true, false, true, true);
        emit ITimeLock.Deposited(user, depositAmount, unlockTime);

        timeLock.deposit{value: depositAmount}(unlockTime);
        
        (uint256 balance, uint256 time) = timeLock.getLockInfo(user);
        assertEq(balance, depositAmount);
        assertEq(time, unlockTime);
        vm.stopPrank();
    }

    function test_RevertIf_WithdrawLocked() public {
        vm.startPrank(user);
        timeLock.deposit{value: 1 ether}(block.timestamp + 1 days);
        timeLock.acceptDisclaimer();

        vm.expectRevert(TimeLock__Locked.selector);
        timeLock.withdraw();
        vm.stopPrank();
    }

    function test_Withdraw_FeeCalculation() public {
        uint256 depositAmount = 10 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.warp(unlockTime + 1);

        vm.prank(user);
        timeLock.acceptDisclaimer();

        uint256 interest = timeLock.pendingReward(user);
        uint256 expectedFee = (depositAmount * timeLock.feePercentage()) / 10000;
        uint256 expectedUserAmount = depositAmount - expectedFee + interest;
        uint256 ownerInitialBalance = address(this).balance;

        timeLock.fundReserve{value: interest}();

        vm.prank(user);
        timeLock.withdraw();

        assertEq(address(user).balance, START_BALANCE - depositAmount + expectedUserAmount);
        assertEq(address(this).balance, ownerInitialBalance + expectedFee - interest);
    }

    function testFuzz_DepositAndWithdraw(uint256 amount, uint256 duration) public {
        amount = bound(amount, 1 ether, START_BALANCE);
        duration = bound(duration, 1, 365 days);
        uint256 unlockTime = block.timestamp + duration;

        timeLock.fundReserve{value: 100 ether}();

        vm.startPrank(user);
        timeLock.deposit{value: amount}(unlockTime);
        timeLock.acceptDisclaimer();

        vm.warp(unlockTime + 1);
        timeLock.withdraw();
        vm.stopPrank();

        assertEq(timeLock.balances(user), 0);
    }

    function test_RevertIf_NonOwnerSetsFee() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        timeLock.setFeePercentage(500);
    }

    receive() external payable {}
}