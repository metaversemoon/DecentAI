import { getNodes } from "./inferenceHelpers";



export async function getInferences() {

    // Ethers code to get all events from the InferenceSubmitted event
    // Take the prompt from each

    // Ethers code to iterate over each event and fetch responses

    const data = await getNodes();
    let outputs = [];
    data.forEach( (node) => {outputs = outputs.concat(node.responses.map(o => {
        return {
            ...o,
            address: node.address,
            cost: node.cost,
        }
    }))} );

    return outputs;

}



export async function submitRating( requestId, inferenceId, rating ) {
    
        // Ethers code to submit rating
    
        return {
            success: true,
            message: "Responses submitted successfully",
            txId: "0x1234567890",
        }
}


