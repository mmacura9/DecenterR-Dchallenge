import { Queue } from '@datastructures-js/queue';
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

export const calculateDebt = async (debt: number, rate: number) : Promise<number> => {
    return Number(debt)*rate / 10 ** 18;
}

export const fetchAllCdpInfo = async (cdpId: number, queue: Queue<number>, rate: number) : Promise<CdpInfo[]> => {
    let cdpIds = [];

    for (let i = 0; i < 5; i++) {
        if (queue.isEmpty()) {
            break;
        }
        if (queue.front() < 0) {
            queue.dequeue();
            i--;
            continue;
        }
        cdpIds.push(queue.dequeue());
    }
    
    const calls = cdpIds.map((cdpId) => getCdpInfo(cdpId)); // Create an array of Promises

    try {
        const results = await Promise.all(calls); // Batch the calls
        for (const result of results) {
            result.debt = await calculateDebt(result.debt, rate);
            result.collateral = Number(result.collateral) / 10 ** 18;
        }
        return results;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}
