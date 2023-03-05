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


  overrides = { gasLimit: 5000000, gasPrice: ethers.utils.parseUnits('2', 'gwei') };

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // throw "Stop here";

  const InferenceManager = await ethers.getContractFactory("DecentAI");
  const inferenceManager = await InferenceManager.deploy(overrides);
  console.log(inferenceManager.deployTransaction);
  await inferenceManager.deployed();

  console.log("InferenceManager address:", inferenceManager.address);

  // overrides.nonce = 131;

  const Token = await ethers.getContractFactory("DecentAICoin");
  const token = await Token.deploy(inferenceManager.address, overrides);
  console.log(token.deployTransaction);
  await token.deployed();

  // Deploy DecentAiNode
  const DecentAINode = await ethers.getContractFactory("DecentAINode");
  const decentAINode = await DecentAINode.deploy(overrides);
  console.log(decentAINode.deployTransaction);
  await decentAINode.deployed();

  var tx = await inferenceManager.setNodeAddress(decentAINode.address, overrides);
  await tx.wait();

  tx = await decentAINode.transferOwnership(inferenceManager.address, overrides);
  await tx.wait();

  console.log("Token address:", token.address);
  console.log("DecentAINode address:", decentAINode.address);

  await sleep(150000);

  if (network.name === "matic" || network.name === "baseGoerli") {

    exec(`npx hardhat verify --contract "contracts/DecentAI.sol:DecentAI" --network ${network.name} ${inferenceManager.address}`, (error, stdout, stderr) => {
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

    exec(`npx hardhat verify --contract "contracts/DecentAICoin.sol:DecentAICoin" --network ${network.name} ${token.address} ${inferenceManager.address}`, (error, stdout, stderr) => {
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

    exec(`npx hardhat verify --contract "contracts/DecentAINode.sol:DecentAINode" --network ${network.name} ${token.address}`, (error, stdout, stderr) => {
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

  delete overrides.nonce;

  // Do tests here

  tx = await inferenceManager.setToken(token.address, overrides);
  await tx.wait();

  // tx = await inferenceManager.registerResponder(0, "", overrides);
  // await tx.wait();

  // tx = await inferenceManager.requestInference("People skiing in Denver mountains", await deployer.getAddress(), 0, overrides);
  // await tx.wait();

  // Image of cat
  // var tx = await inferenceManager.recieveInference(0, "https://images.unsplash.com/photo-1606787758881-8e1b0b5b0f1d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80");



  // tx = await inferenceManager.recieveInference(1, "", overrides);
  // await tx.wait();


  // tx = await inferenceManager.rateInference(1, 0, 9, overrides);
  // await tx.wait();



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
