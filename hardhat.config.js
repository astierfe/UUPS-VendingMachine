require("solidity-coverage");
require("@nomiclabs/hardhat-waffle");
require("@openzeppelin/hardhat-upgrades");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/3NWC-_k0lKo09jP1siznT",
      accounts: ["f6d4a9501570437c223e0dc8030478a4b8489152fc532c8a0e03e8be5ff2d22d"],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};