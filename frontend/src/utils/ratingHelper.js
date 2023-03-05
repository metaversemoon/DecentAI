import { getNodes } from "./inferenceHelpers";



export async function getInferences() {

    // Ethers code to get all events from the InferenceSubmitted event
    // Take the prompt from each

    // Ethers code to iterate over each event and fetch responses

    const data = await getNodes();
    console.log('nodes', data)
    let outputs = [];
    data.forEach( (node) => {outputs = outputs.concat(node.responses.map((o, i) => {
        return {
            ...o,
            address: node.address,
            cost: node.cost,
        }
    }))} );
    console.log('outputs', outputs)

    return outputs;

}



