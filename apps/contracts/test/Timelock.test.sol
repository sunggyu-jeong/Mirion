pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TimeLock} from "../src/TimeLock.sol";

contract TimeLockTest is Test {
    TimeLock public timeLock;
    address public user = makeAddr("user");
    uint256 public constant START_BALANCE = 10 ether;

    function setUp() public {
        timeLock = new TimeLock();
        vm.deal(user, START_BALANCE);
    }

    function testDeposit() public {
        vm.startPrank(user);

        uint256 unlockTime = block.timestamp + 1 days;
        timeLock.deposit{ value: 1 ether }(unlockTime);

        assertEq(timeLock.balances(user), 1 ether);
        assertEq(timeLock.unlockTimes(user), unlockTime); 

        vm.stopPrank();
    }

    function testRevertIfLocked() public {
        vm.startPrank(user);

        uint256 unlockTime = block.timestamp + 1 days;
        timeLock.deposit{ value : 1 ethers }(unlockTime);

        vm.expectRevert();

        timeLock.withdraw();
        vm.stopPrank();
    }

    function testRevertIfUnLocked public {
        vm.startPrank(user);

        uint256 unlockTime = block.timestamp + 1 days;
        timeLock.deposit{ value: 1 ether }(unlockTime);

        vm.warp(block.timestamp + 1 days + 1 seconds);

        timeLock.withdraw()

        assertEq(address(user).balance, START_BALANCE)
        assertEq(timeLock.balance(user), 0)

        vm.stopPrank();
    }
}