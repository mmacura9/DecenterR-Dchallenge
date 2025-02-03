require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    tenderly: {
      url: "https://virtual.mainnet.rpc.tenderly.co/c87da9e9-5721-457f-b85e-2d84532baa39",
      chainId: 73571,
    },
  },
  tenderly: {
    username: "marko_macura",
    project: "decenterr-d",
  },
};
