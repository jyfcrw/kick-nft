const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config()
const mnemonic = process.env.HD_WALLET_SECRET.toString().trim()
const repstenEndpoint = `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`

module.exports = {
  contracts_build_directory: '../dapp/src/contracts',
  mocha: {
    // timeout: 500000
  },
  compilers: {
    solc: {
      version: '0.8.10',    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: true,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
    },
    ganache: {
      host: '172.21.240.1',
      port: 7545,
      network_id: 5777,
      // from: '',
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(mnemonic, repstenEndpoint)
      },
      networkCheckTimeout: 50000, 
      network_id: 3,       // Ropsten's id
      gas: 5500000,        // Ropsten has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
      // from: '',
    },
  },
}
