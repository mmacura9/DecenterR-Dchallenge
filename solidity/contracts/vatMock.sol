// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VatMock {
    mapping(bytes32 => uint256) public ilks_map;

    function setIlkInfo(bytes32 ilk, uint256 rate) external {
        ilks_map[ilk] = rate;
    }

    function ilks(bytes32 ilk) external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (0, ilks_map[ilk], 0, 0, 0);
    }
}
