// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../interface/ILido.sol";

contract MockLido is ILido {
    uint256 public shareValue = 1e18;

    function submit(address) external payable returns (uint256 sharesAmount) {
        sharesAmount = (msg.value * 1e18) / shareValue;
    }

    function redeem(uint256 _sharesAmount) external returns (uint256 ethAmount) {
        ethAmount = (_sharesAmount * shareValue) / 1e18;
        (bool success,) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "MockLido: transfer failed");
    }

    function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256) {
        return (_sharesAmount * shareValue) / 1e18;
    }

    function getSharesByPooledEth(uint256 _ethAmount) external view returns (uint256) {
        return (_ethAmount * 1e18) / shareValue;
    }

    function setShareValue(uint256 _newValue) external {
        shareValue = _newValue;
    }

    receive() external payable {}
}
