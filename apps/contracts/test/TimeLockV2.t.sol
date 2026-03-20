// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {TimeLock} from "../src/TimeLock.sol";
import {ITimeLock} from "../src/interface/ITimeLock.sol";
import {MockLido} from "../src/mocks/MockLido.sol";
import "../src/errors/TimeLockErrors.sol";

contract TimeLockV2Test is Test {
    MockLido public mockLido;
    TimeLock public timeLock;

    address public user = makeAddr("user");
    address public relayer = makeAddr("relayer");
    address public owner;

    uint256 public constant START_BALANCE = 100 ether;
    uint256 public constant RESERVE_FUND = 10 ether;

    function setUp() public {
        owner = address(this);
        mockLido = new MockLido();
        timeLock = new TimeLock(address(mockLido));
        timeLock.setRelayer(relayer);
        vm.deal(user, START_BALANCE);
        timeLock.fundReserve{value: RESERVE_FUND}();
    }

    function test_Deposit_SendsEthToLido() public {
        uint256 depositAmount = 1 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        assertEq(address(mockLido).balance, depositAmount);
        assertEq(address(timeLock).balance, RESERVE_FUND);
    }

    function test_Deposit_StoresShares() public {
        uint256 depositAmount = 1 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        (uint256 balance,) = timeLock.getLockInfo(user);
        assertEq(balance, depositAmount);
    }

    function test_Withdraw_ConvertsSharesBackToEth() public {
        uint256 depositAmount = 5 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.warp(unlockTime + 1);

        vm.prank(user);
        timeLock.acceptDisclaimer();

        uint256 interest = timeLock.pendingReward(user);
        uint256 fee = (depositAmount * timeLock.feePercentage()) / 10000;
        uint256 balanceBefore = address(user).balance;

        vm.prank(user);
        timeLock.withdraw();

        assertEq(address(user).balance, balanceBefore + depositAmount - fee + interest);
    }

    function test_Withdraw_IncludesLidoYield() public {
        uint256 depositAmount = 1 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        mockLido.setShareValue(1.1e18);

        vm.warp(unlockTime + 1);

        vm.prank(user);
        timeLock.acceptDisclaimer();

        uint256 balanceBefore = address(user).balance;

        vm.deal(address(mockLido), 10 ether);

        vm.prank(user);
        timeLock.withdraw();

        assertGt(address(user).balance, balanceBefore);
    }

    function test_RecordGasAdvance_UpdatesMapping() public {
        uint256 gasAmount = 0.01 ether;

        vm.prank(relayer);
        timeLock.recordGasAdvance(user, gasAmount);

        assertEq(timeLock.gasAdvanced(user), gasAmount);
    }

    function test_RevertIf_NonRelayerCallsRecordGasAdvance() public {
        vm.prank(user);
        vm.expectRevert(TimeLock__NotRelayer.selector);
        timeLock.recordGasAdvance(user, 0.01 ether);
    }

    function test_Withdraw_DeductsGasAdvanced() public {
        uint256 depositAmount = 5 ether;
        uint256 unlockTime = block.timestamp + 1 days;
        uint256 gasAdvance = 0.01 ether;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.prank(relayer);
        timeLock.recordGasAdvance(user, gasAdvance);

        vm.warp(unlockTime + 1);

        vm.prank(user);
        timeLock.acceptDisclaimer();

        uint256 interest = timeLock.pendingReward(user);
        uint256 fee = (depositAmount * timeLock.feePercentage()) / 10000;
        uint256 balanceBefore = address(user).balance;

        vm.prank(user);
        timeLock.withdraw();

        uint256 expected = balanceBefore + depositAmount - fee - gasAdvance + interest;
        assertEq(address(user).balance, expected);
    }

    function test_AcceptDisclaimer_SetsFlag() public {
        vm.prank(user);
        timeLock.acceptDisclaimer();

        assertTrue(timeLock.acceptedDisclaimer(user));
    }

    function test_AcceptDisclaimer_EmitsEvent() public {
        vm.expectEmit(true, false, false, false);
        emit ITimeLock.DisclaimerAccepted(user);

        vm.prank(user);
        timeLock.acceptDisclaimer();
    }

    function test_RevertIf_WithdrawWithoutDisclaimer() public {
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: 1 ether}(unlockTime);

        vm.warp(unlockTime + 1);

        vm.expectRevert(TimeLock__DisclaimerNotAccepted.selector);
        vm.prank(user);
        timeLock.withdraw();
    }

    function test_Withdraw_ClearsGasAdvanced() public {
        uint256 depositAmount = 5 ether;
        uint256 unlockTime = block.timestamp + 1 days;

        vm.prank(user);
        timeLock.deposit{value: depositAmount}(unlockTime);

        vm.prank(relayer);
        timeLock.recordGasAdvance(user, 0.01 ether);

        vm.warp(unlockTime + 1);

        vm.prank(user);
        timeLock.acceptDisclaimer();

        vm.prank(user);
        timeLock.withdraw();

        assertEq(timeLock.gasAdvanced(user), 0);
    }

    function test_SnapshotInterest_EmitsEvent() public {
        uint256 unlockTime = block.timestamp + 365 days;

        vm.prank(user);
        timeLock.deposit{value: 1 ether}(unlockTime);

        vm.warp(block.timestamp + 1 days);

        address[] memory users = new address[](1);
        users[0] = user;

        vm.expectEmit(true, false, false, false);
        emit ITimeLock.DailyInterestSnapshot(user, 0, block.timestamp);

        vm.prank(relayer);
        timeLock.snapshotInterest(users);
    }

    function test_RevertIf_NonRelayerCallsSnapshot() public {
        address[] memory users = new address[](1);
        users[0] = user;

        vm.prank(user);
        vm.expectRevert(TimeLock__NotRelayer.selector);
        timeLock.snapshotInterest(users);
    }

    function test_SetRelayer_OnlyOwner() public {
        address newRelayer = makeAddr("newRelayer");
        timeLock.setRelayer(newRelayer);
        assertEq(timeLock.relayer(), newRelayer);
    }

    function test_RevertIf_NonOwnerSetsRelayer() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        timeLock.setRelayer(user);
    }

    receive() external payable {}
}
