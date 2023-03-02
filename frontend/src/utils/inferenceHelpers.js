

// Inference page has the following
// Connect wallet
// Drop down to select a node with it's rating, address, experience and cost mentioned
// Textbox for a prompt
// Textbox for number of tokens to pay for the inference


export function getNodes() {
    return [
        {
            rating: 4.5,
            address: "0x1234567890",
            countInferences: 100,
            cost: 0.1,
            active: true,
            firstInference: "2021-01-01T00:00:00Z",
        },
        {
            rating: 4.5,
            address: "0x1234567890",
            countInferences: 100,
            cost: 0.1,
            active: true,
            firstInference: "2021-01-01T00:00:00Z",
        }
    ]
}




export function submitForInference(nodeAddress, prompt, offer) {

    // Ethers code to submit the inference

    return {
        success: true,
        message: "Inference submitted successfully",
        txId: "0x1234567890",
    }
}


