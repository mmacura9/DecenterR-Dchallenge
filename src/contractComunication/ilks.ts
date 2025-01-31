import { ilkABI } from '../contractABI/ilk';
import { stringToBytes } from '../utils/bytesToString';
import { web3 } from '../utils/web3';

const contractAddress = '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B';
const contract = new web3.eth.Contract(ilkABI, contractAddress);

export interface IlkInfo {
    Art: number;
    rate: BigInt;
    spot: BigInt;
    line: BigInt;
    dust: BigInt;
}
export const getIlkInfo = async (ilkName: string) : Promise<IlkInfo> => {
    const ilkBytes32 = stringToBytes(ilkName);
    const result = await contract.methods.ilks(ilkBytes32).call() as IlkInfo;

    // console.log(`ILK: ${ilkName}`);
    // console.log(`Debt (Art): ${result.Art}`);
    // console.log(`Rate: ${result.rate}`);
    // console.log(`Spot: ${result.spot}`);
    // console.log(`Debt Ceiling (line): ${result.line}`);
    // console.log(`Dust: ${result.dust}`);
    return result;
}