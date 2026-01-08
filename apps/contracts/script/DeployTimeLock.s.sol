// SPDX-License-Identifier: MIT
import { Script, console } from "forge-std/Script.sol";
import { TimeLock } from "../src/TimeLock.sol";

contract DeployTimeLock is Script {
    function run() external {
        
        vm.startBroadcast();

        TimeLock timeLock = new TimeLock();

        console.log("TimeLock deployed to:", address(timeLock));
        vm.stopBroadcast();
    }
}