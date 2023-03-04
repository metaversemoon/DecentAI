import { getNodes } from "./utils/inferenceHelpers";

export const fetchNodes = async () => {
    return await getNodes()
}

export function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }