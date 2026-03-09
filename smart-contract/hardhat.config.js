/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();

module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      url: process.env.ETH_RPC_URL || 'https://rpc.sepolia.org',
      accounts: process.env.ESCROW_WALLET_PRIVATE_KEY ? [process.env.ESCROW_WALLET_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
