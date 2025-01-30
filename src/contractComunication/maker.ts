import { makerABI } from "../contractABI/makerDAO";
import { web3 } from '../utils/web3';

const contractAddress = '0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d';
const contract = new web3.eth.Contract(makerABI, contractAddress);

export interface CdpInfo {
    id: number;
    urn: string;
    owner: string;
    userAddr: string;
    ilk: string;
    collateral: number;
    debt: number;
}

export const getCdpInfo = async (cdpId: number) : Promise<CdpInfo>=> {
    const result = await contract.methods.getCdpInfo(cdpId).call() as CdpInfo;
    result.id = cdpId;

    return result;
}

export const fetchAllCdpInfo = async (cdpId: number, offset: number) : Promise<CdpInfo[]> => {
    let cdpIds = [cdpId + offset, cdpId - offset];
    if (cdpId - offset < 0) {
        cdpIds = [cdpId + offset];
    }
    const calls = cdpIds.map((cdpId) => getCdpInfo(cdpId)); // Create an array of Promises

    try {
        const results = await Promise.all(calls); // Batch the calls
        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}
