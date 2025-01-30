import Web3 from 'web3';

const generateWeb3 = () => {
    if (!window.ethereum) {
        alert('Please install MetaMask first.');
        throw new Error('MetaMask not found');
    }
    const INFURA_URL = `https://mainnet.infura.io/v3/8b33380e04f34efa9ed482be7c9aa80b`;
    console.log(INFURA_URL);
    const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
    return web3;
}
export const web3 = generateWeb3();