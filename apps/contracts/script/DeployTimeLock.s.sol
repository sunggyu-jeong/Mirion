// SPDX-License-Identifier: MIT
import { Script, console } from "forge-std/Script.sol";
import { TimeLock } from "../src/TimeLock.sol";

contract DeployTimeLock is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        TimeLock timeLock = new TimeLock();

        console.log("TimeLock deployed to:", address(timeLock));
        vm.stopBroadcast();
    }
}