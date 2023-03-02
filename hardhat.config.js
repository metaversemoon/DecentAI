require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
const fs = require("fs");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337 // We set 1337 to make interacting with MetaMask simpler
    },
    matic: {
      url: 'https://polygon-mainnet.infura.io/v3/f9f9c829617b43248215db1314a0fbd9',
      gasPrice: 60000000000,
      gas: 4000000,
      accounts: {
        mnemonic: mnemonic(),
      },
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
