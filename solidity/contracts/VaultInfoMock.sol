// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VaultInfoMock {
    mapping(bytes32 => address) public urns;
    mapping(bytes32 => address) public owners;
    mapping(bytes32 => address) public userAddrs;
    mapping(bytes32 => bytes32) public ilks;
    mapping(bytes32 => uint256) public collaterals;
    mapping(bytes32 => uint256) public debts;

    function setCdpInfo(
        bytes32 cdpId,
        address urn,
        address owner,
        address userAddr,
        bytes32 ilk,
        uint256 collateral,
        uint256 debt
    ) external {
        urns[cdpId] = urn;
        owners[cdpId] = owner;
        userAddrs[cdpId] = userAddr;
        ilks[cdpId] = ilk;
        collaterals[cdpId] = collateral;
        debts[cdpId] = debt;
    }

    function getCdpInfo(bytes32 cdpId)
        external
        view
        returns (
            address urn,
            address owner,
            address userAddr,
            bytes32 ilk,
            uint256 collateral,
            uint256 debt
        )
    {
        return (
            urns[cdpId],
            owners[cdpId],
            userAddrs[cdpId],
            ilks[cdpId],
            collaterals[cdpId],
            debts[cdpId]
        );
    }
}
