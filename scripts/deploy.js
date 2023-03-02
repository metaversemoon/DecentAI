// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");
const { ethers } = require("hardhat");
const { exec } = require("child_process");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Nonce of deployer account : ", await deployer.getTransactionCount());


  overrides = { gasLimit: 5000000, gasPrice: ethers.utils.parseUnits('500', 'gwei'), nonce: 116 };

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // throw "Stop here";

  const InferenceManager = await ethers.getContractFactory("InferenceManager");
  const inferenceManager = await InferenceManager.deploy(overrides);
  console.log(inferenceManager.deployTransaction);
  await inferenceManager.deployed();

  console.log("InferenceManager address:", inferenceManager.address);

  overrides.nonce = 117;

  const Token = await ethers.getContractFactory("DecentralizedAI");
  const token = await Token.deploy(inferenceManager.address, overrides);
  console.log(token.deployTransaction);
  await token.deployed();

  console.log("Token address:", token.address);

  await sleep(150000);

  if (network.name === "matic") {

    exec(`npx hardhat verify --contract "contracts/InferenceManager.sol:InferenceManager" --network ${network.name} ${inferenceManager.address}`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });

    exec(`npx hardhat verify --contract "contracts/DecentralizedAI.sol:DecentralizedAI" --network ${network.name} ${token.address} ${inferenceManager.address}`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }

  await sleep(150000);

  // Do tests here


  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
