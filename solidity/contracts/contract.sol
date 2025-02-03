// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVat {
    function urns(bytes32 ilk, address urn) external view returns (uint256, uint256 );
    function ilks(bytes32 ilk) external view returns (uint256, uint256, uint256, uint256, uint256);
}

interface IVaultInfo {
    function getCdpInfo(uint256 cdpId) external view returns (address, address, address, bytes32, uint256, uint256);
}

contract CDPInfo {
    IVat public vat;
    IVaultInfo public vaultInfo;

    constructor(address _vat, address _vaultInfo) {
        vat = IVat(_vat);
        vaultInfo = IVaultInfo(_vaultInfo);
    }

    struct CdpInfo {
        address urn;
        address owner;
        address userAddr;
        bytes32 ilk;
        uint256 collateral;
        uint256 debt;
        uint256 debtWithInterest;
    }

    function getCdpInfoFromVaultInfo(uint256 cdpId) external view returns (CdpInfo memory) {
        (address urn, address owner, address userAddr, bytes32 ilk, uint256 collateral, uint256 debt) = vaultInfo.getCdpInfo(cdpId);
        (,uint256 rate,,,) = vat.ilks(ilk);
        uint256 debtWithInterest = debt * rate / 10**27;
        CdpInfo memory cdp = CdpInfo(urn, owner, userAddr, ilk, collateral, debt, debtWithInterest);
        return cdp;
    }
}
