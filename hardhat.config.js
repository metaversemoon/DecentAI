require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
const fs = require("fs");
// require("@fireblocks/hardhat-fireblocks");

const dotenv = require('dotenv');
dotenv.config();

// const { ApiBaseUrl } = require("@fireblocks/fireblocks-web3-provider");

console.log(process.env.FIREBLOCKS_API_KEY);
console.log(process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
    },
    matic: {
      url: 'https://polygon-mainnet.infura.io/v3/f9f9c829617b43248215db1314a0fbd9',
      gasPrice: 60000000000,
      gas: 4000000,
      accounts: {
        mnemonic: mnemonic(),
      },
      // fireblocks: {
      //   apiBaseUrl: ApiBaseUrl.Sandbox, // If using a sandbox workspace
      //   privateKey: pvtKey(),
      //   apiKey: process.env.FIREBLOCKS_API_KEY,
      //   vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS,
      // }
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/ad1540581ba746208c1d10b3192c177e",
      gasPrice: 60000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
      // fireblocks: {
      //   apiBaseUrl: ApiBaseUrl.Sandbox, // If using a sandbox workspace
      //   privateKey: pvtKey(),
      //   apiKey: process.env.FIREBLOCKS_API_KEY,
      //   vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS,
      // }
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    // apiKey: "87RP6PBVRSBTRE2U8IB7JZ4765M31BRJEX",
    apiKey: "TAMV18WAXE345WENH3GF2F8GFQGWADH3F6",
  }
};


function mnemonic() {
  try {
    return fs.readFileSync("./mnemonic.txt").toString().trim();
  } catch (e) {
    console.log(e);
    if (defaultNetwork !== "localhost") {
      console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
    }
  }
  return "";
}

function pvtKey() {
  try {
    return fs.readFileSync("./private-key.txt").toString().trim();
  } catch (e) {
    console.log(e);
    if (defaultNetwork !== "localhost") {
      console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
    }
  }
  return "";
}

function apiKey() {
  try {
    return fs.readFileSync("./api-key.txt").toString().trim();
  } catch (e) {
    console.log(e);
    if (defaultNetwork !== "localhost") {
      console.log("☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.")
    }
  }
  return "";
}

