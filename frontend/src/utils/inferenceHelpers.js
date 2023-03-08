

// Inference page has the following
// Connect wallet
// Drop down to select a node with it's rating, address, experience and cost mentioned
// Textbox for a prompt
// Textbox for number of tokens to pay for the inference
import { ethers } from "ethers";
import InferenceManagerArtifacts from "../abis/inferenceManager.json";
import TokenArtifacts from "../abis/token.json";

import { providers } from "./provider";

import {GaslessOnboarding} from '@gelatonetwork/gasless-onboarding'
import { GaslessWalletConfig, LoginConfig} from '@gelatonetwork/gasless-onboarding'

// const inference_manager_contract = "0x7C14dd39c29a22E69b99E41f7A3E607bfb63d244";
// const token_contract = "0x8af1731Da3e3a0705f5B9738FAD983Cd24332d45";

// Base old contracts with bug
// const inference_manager_contract = "0x9d5CD448332A857F6BfDb7541CFc33C61789BB41";
// const token_contract = "0x26b29286A6D8cE5d0BCD40121ACB8BdF120F08f4";

// Base new contracts without bug
const inference_manager_contract = "0x5755f4B547596c4cc45AA898e076cd75EA10f374";
const token_contract = "0xCBd25f30FdfE9bBA2e423F90342F9d9E5bf433fa";

let network = "matic"

let loginConfig = {
    chain: {
        id: 84531,
        rpcUrl: "https://goerli.base.org"
    },
    domains: [
        window.location.origin
    ]

}
let walletConfig = {
    apiKey: '3vA3QjzNh9099IAw5VA_wlGaNpGSf2rDh_tfhtt4alY_'
}
let gaslessWallet = new GaslessOnboarding(loginConfig, walletConfig)


export async function getNodesCount() {
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( network));
    let eventFilter = contract.filters.ResponderAdded();
    let events = await contract.queryFilter(eventFilter);
    return events.length

}

export async function getNodes() {

    // Get all ResponderAdded events from the InferenceManager contract
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( network));

    let reqEventFilter = contract.filters.RequestRecieved();
    let reqEvents = await contract.queryFilter(reqEventFilter);

    const requests = {};
    for (let i = 0; i < reqEvents.length; i++) {
        const requestId = ethers.BigNumber.from(reqEvents[i].args[1]).toString();
        const prompt = reqEvents[i].args[2];
        requests[requestId] = prompt;
    }

    let respEventFilter = contract.filters.ResponseRecieved();
    let respEvents = (await contract.queryFilter(respEventFilter))

    const responses = {};

    const inferenceIds = {}

    for (let i = 0; i < respEvents.length; i++) {

        const responder = respEvents[i].args[1];
        if (!responses[responder]) {
            responses[responder] = [];
        }
        const requestId = ethers.BigNumber.from(respEvents[i].args[0]).toString();
        const url = 'https://punksvsapes.mypinata.cloud/ipfs/' + respEvents[i].args[2];

        try {
            console.log(url)

            let actualImageUrl = ''
            if (i <= 3) {
                let response = await fetch(url)
                let data = await response.json()
                actualImageUrl = 'https://punksvsapes.mypinata.cloud/ipfs/' + data.image
            }
          

            inferenceIds[requestId] = inferenceIds[requestId] ? inferenceIds[requestId] + 1 : 0

            responses[responder].push({
                requestId: requestId,
                prompt: requests[requestId],                
                url: actualImageUrl,
                inferenceId: inferenceIds[requestId]
            });
        } catch (e) {
            console.log(e)
        }
      
       
    }

    let eventFilter = contract.filters.ResponderAdded();
    let events = await contract.queryFilter(eventFilter);

    // console.log(events);

    const nodes = [];

    for (let i = 0; i < events.length; i++) {
        // console.log(events[i].args);
        const addr = events[i].args[0];
        const responder = await contract.responders(addr);
        // console.log(responder);
        const active = responder[0];
        const countInferences = ethers.BigNumber.from(responder[1]).toString();
        const averageRating = ethers.BigNumber.from(responder[2]).toString();
        const countRating = ethers.BigNumber.from(responder[3]).toString();
        const cost = ethers.BigNumber.from(responder[4]).toString();

        nodes.push({
            address: addr,
            active: active,
            countInferences: countInferences,
            averageRating: averageRating,
            countRating: countRating,
            cost: cost,
            responses: responses[addr] || [],
        });
    }

    return nodes;
}


export const signedAIContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, signer);
    return contract
}

export const signedTokenContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(token_contract, TokenArtifacts, signer);
    return contract
}

export const tokenContract = async () => {
    const contract = new ethers.Contract(token_contract, TokenArtifacts, await providers( network ));
    return contract
}

export const AIContract = async () => {
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( network ));
    return contract
}

export async function submitForInference(text, node, offer) {

    let token = await signedTokenContract()

    if (token.allowance(node) < offer) {
        console.log('not enough allowance.')
        await token.approve(node, ethers.constants.MaxInt256)
    } else {
        console.log('enough allowance.')
    }

    let contract = await signedAIContract()
    let requestId = await contract.requestInference(text, node, offer)

    console.log('inference request success')
    return requestId
}

export async function submitForInferenceGasless(text, node, offer) {

    let token = await tokenContract()
    await gaslessWallet.init()

    let wallet = gaslessWallet.getGaslessWallet()

    await wallet.init()

    if (token.allowance(node) < offer) {
        console.log('not enough allowance.')
        let tx = await token.populateTransaction.approve(node, ethers.constants.MaxInt256)
        await wallet.sponsorTransaction(tx.to, tx.data)
    } else {
        console.log('enough allowance.')
    }

    let contract = await AIContract()

    let tx = await contract.populateTransaction.requestInference(text, node, offer)
    await wallet.sponsorTransaction(tx.to, tx.data)

    let currentId = await contract.requestId()
    let newId = parseInt(currentId) + 1
    console.log('inference request success: new Id' + newId)
    return newId
}

export async function waitForResponse(requestId, callback) {
    console.log('listening for event ' + requestId)
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( network ));

    contract.on("ResponseRecieved", (id, node, url) => {
        console.log('Response is here: ' + id, node, url);

        console.log('original requestId: ' + requestId)

        if (id == requestId) {
            console.log('requestid matches')
            callback(url)
        }
    });
}

export async function submitRating( requestId, inferenceId, rating ) {
    console.log('submitting rating ' + requestId, inferenceId, rating)

    await gaslessWallet.init()

    let wallet = gaslessWallet.getGaslessWallet()
    await wallet.init()
    let contract = await AIContract()
    let tx = await contract.populateTransaction.rateInference(requestId, inferenceId, rating)
    await wallet.sponsorTransaction(tx.to, tx.data)
}

