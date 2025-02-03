import Web3 from 'web3';

const generateWeb3 = () => {
    if (!window.ethereum) {
        alert('Please install MetaMask first.');
        throw new Error('MetaMask not found');
    }
    
    const web3 = new Web3(window.ethereum);
    return web3;
}
export const web3 = generateWeb3();