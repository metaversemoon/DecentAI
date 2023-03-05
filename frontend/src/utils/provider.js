
// import { ethers } from 'ethers';
import { ethers } from "ethers";

export const providers = async ( chain ) =>
{

    // return providerUrls.get( chain ).wsUrl
    //     ? new WebSocketProvider( providerUrls.get( chain ).wsUrl )
    //     : new ethers.providers.JsonRpcProvider( providerUrls.get( chain ).url );

    const wssUrl = "wss://polygon-mainnet.g.alchemy.com/v2/_tn9X7pFnXwYXYi8Q33gQjRg_B3Dey_4";

    const httpUrl = "https://goerli.base.org"


    // return new ethers.providers.WebSocketProvider(wssUrl);

    return new ethers.providers.JsonRpcProvider( httpUrl );


};


