const hre = require("hardhat");

async function main() {
    const MyContract = await hre.ethers.getContractFactory("CDPInfo");
    const myContract = await MyContract.deploy("0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b", "0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d");

    console.log("Contract deployed to:", myContract.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});