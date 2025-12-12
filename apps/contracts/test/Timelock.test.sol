pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TimeLock} from "../src/TimeLock.sol";

contract TimeLockTest is Test {
    TimeLock public timeLock;
    address public user = makeAddr("user");
    uint256 public constant START_BALANCE = 10 ether;

    function setup() public {
        timeLock = new TimeLock();
        vm.deal(user, START_BALANCE);
    }

    function testDeposit() public {
        vm.prank(user);

        uint256 unlockTime = block.timestamp + 1 days;
        timeLock.deposit{ value: 1 ether }(unlockTime);

        assertEq(timeLock.balances(user), 1 ether);
        assertEq(timeLock.unlockTimes(user), unlockTime); 
    }

    function testRevertIfLocked() public {
        
    }
}