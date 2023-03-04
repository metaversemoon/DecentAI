

// Inference page has the following
// Connect wallet
// Drop down to select a node with it's rating, address, experience and cost mentioned
// Textbox for a prompt
// Textbox for number of tokens to pay for the inference
import { ethers } from "ethers";
import InferenceManagerArtifacts from "../abis/inferenceManager.json";
import TokenArtifacts from "../abis/token.json";

import { providers } from "./provider";

const inference_manager_contract = "0x7C14dd39c29a22E69b99E41f7A3E607bfb63d244";
const token_contract = "0x8af1731Da3e3a0705f5B9738FAD983Cd24332d45";


export async function getNodes() {

    // Get all ResponderAdded events from the InferenceManager contract
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( "matic" ));

    let reqEventFilter = contract.filters.RequestRecieved();
    let reqEvents = await contract.queryFilter(reqEventFilter);

    const requests = {};
    for (let i = 0; i < reqEvents.length; i++) {
        const requestId = ethers.BigNumber.from(reqEvents[i].args[1]).toString();
        const prompt = reqEvents[i].args[2];
        requests[requestId] = prompt;
    }

    let respEventFilter = contract.filters.ResponseRecieved();
    let respEvents = await contract.queryFilter(respEventFilter);

    const responses = {};

    for (let i = 0; i < respEvents.length; i++) {

        const responder = respEvents[i].args[1];
        if (!responses[responder]) {
            responses[responder] = [];
        }
        const requestId = ethers.BigNumber.from(respEvents[i].args[0]).toString();
        const url = respEvents[i].args[2];

        try {
            // console.log('lol' + url)
            // let response = await fetch(url)
            // let data = await response.json()
            // console.log('lol' + data)
            // let actualImageUrl = data.image

            responses[responder].push({
                requestId: requestId,
                prompt: requests[requestId],                
                url: url,
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
    return 23
}

export async function waitForResponse(requestId, callback) {
    console.log('listening for event')
    const contract = new ethers.Contract(inference_manager_contract, InferenceManagerArtifacts, await providers( "matic" ));

    contract.on("ResponseRecieved", (id, node, url) => {
        console.log('Response is here: ' + id, node, url);

        if (id == requestId) {
            callback(url)
        }
    });
}


