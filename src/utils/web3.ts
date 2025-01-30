import Web3 from 'web3';

const generateWeb3 = () => {
    if (!window.ethereum) {
        alert('Please install MetaMask first.');
        throw new Error('MetaMask not found');
    }
    const INFURA_URL = `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`;
    const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
    return web3;
}
export const web3 = generateWeb3();