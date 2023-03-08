// SPDX-License-Identifier: MIT

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IDecentAICoin.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./IDecentAINode.sol";

contract DecentAI is ERC721, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Request {
        uint256 start;
        uint8 countInferences;
        uint256 offer;
        address responder;
        bool paid;
        address requestor;
    }

    uint256 public constant MAX_INFERENCES = 10;
    uint256 public requestId = 0;

    // Requests are stored in a mapping
    mapping(uint256 => Request) public requests;

    // Staked tokens
    mapping(address => uint256) public staked;

    // Events are fired which contain information about the requested inference
    event RequestRecieved(address indexed requestor, uint256 requestId, string prompt, uint256 offer, address indexed responder);

    struct Response {
        string url;
        address responder;
    }

    // Requests are stored in a mapping
    mapping(uint256 => Response[]) public responses;

    // Event is fired when a response is submitted
    event ResponseRecieved(uint256 requestId, address indexed responder, string url);

    // Define a struct for a responder to store reputation and number of inferences
    struct Responder {
        bool active;
        uint256 countInferences;
        uint256 averageRating;
        uint256 countRating;
        uint256 cost;
    }

    // Store responders in a mapping
    mapping(address => Responder) public responders;

    // Event is fired when a responder is added
    event ResponderAdded(address indexed responder, uint256 cost, uint256 tokenId);

    // Event is added when a responser is removed
    event ResponderRemoved(address indexed responder);

    // Event to fire when rating is recieved
    event RatingRecieved( uint256 requestId, uint256 inferenceId, address indexed responder, address indexed rater, uint256 rating);

    // ERC20 token address
    address public token;
    bool public tokenSet = false;

    // Constant for amount minted per rating
    uint256 public constant RATING_REWARD = 5;

    // Constant for maximum wait time for a request before it can be withdrawn
    uint256 public TIMEOUT = 86400;

    // Minimum number of inferences before Inference node can start to earn
    uint256 public MIN_INFERENCES = 10;

    // Address of the DecentAI Node NFT contract
    address public nodeAddress;
    bool public nodeAddressSet = false;

    constructor() ERC721("DecentAI", "DAI") {}

    // Set the token address
    function setToken(address _token) public onlyOwner {
        require(!tokenSet, "Coin token set");
        token = _token;
        tokenSet = true;
    }

    // Set node token address
    function setNodeAddress(address _nodeAddress) public onlyOwner {
        require(!nodeAddressSet, "Node token set");
        nodeAddress = _nodeAddress;
        nodeAddressSet = true;

    }


    // Add a request
    function requestInference(string calldata prompt, address responder, uint256 offer) public {
        // require(offer > 0, "Offer must be greater than 0");
        requestId++;
        requests[requestId] = Request(block.timestamp, 0, offer, responder, false, msg.sender);

        // Transfer the required cost in ERC20 tokens to the contract
        IDecentAICoin(token).transferFrom(msg.sender, address(this), offer);


        staked[msg.sender] += offer;

        emit RequestRecieved(msg.sender, requestId, prompt, offer, responder);

    }

    // Add a response
    function recieveInference(uint256 id, string memory url) public {
        require(responders[msg.sender].active, "Responder inactive");
        require(requests[id].start > 0, "Request inexistant");
        require(requests[id].countInferences < MAX_INFERENCES, "Max inferences reached");
        require( (requests[id].responder == address(0x0)) || ((requests[id].responder != address(0x0)) && (requests[id].responder == msg.sender)), "Incorrect responder");
        require((responders[msg.sender].cost <= requests[id].offer), "Insufficient offer");

        responses[id].push(Response(url, msg.sender));
        requests[id].countInferences++;
        responders[msg.sender].countInferences++;

        // Transfer the cost to the first legal responder
        if (requests[id].paid == false) {
            IDecentAICoin(token).transferFrom(address(this), msg.sender, requests[id].offer);
            requests[id].paid = true;
        }
        
        // Mint the results as an NFT to the requestor
        safeMint(requests[id].requestor, url);

        // Reduce the staked amount
        staked[requests[id].requestor] -= requests[id].offer;

        // Emit the event
        emit ResponseRecieved(id, msg.sender, url);

    }
    
    function withdrawRequest(uint256 id) public {
        require(requests[id].start > 0, "Request inexistant");
        require(requests[id].requestor == msg.sender, "Not the requestor");
        require((requests[id].start + TIMEOUT) < block.timestamp, "Timeout");

        // Transfer the cost to the requestor
        IDecentAICoin(token).transferFrom(address(this), msg.sender, requests[id].offer);

        // Reduce the staked amount
        staked[msg.sender] -= requests[id].offer;

        // Delete the request
        delete requests[id];
    }

    // Register a responder
    function registerResponder(uint256 cost, string memory url) public {
        responders[msg.sender] = Responder(true, 0, 0, 0, cost);

        // Mint a node NFT to the responder
        IDecentAINode iDecentAINode = IDecentAINode(nodeAddress);
        uint256 tokenId = iDecentAINode.safeMint(msg.sender, url);

        emit ResponderAdded(msg.sender, cost, tokenId);
    }

    // Remove a responder 
    function removeResponder(address responder) public onlyOwner {
        responders[responder].active = false;
        emit ResponderRemoved(responder);
    }

    // Accept user scoring of inference
    function rateInference(uint256 id, uint256 inferenceId, uint256 rating) public {
        require(responses[id].length >= inferenceId, "Inference inexistant");
        require(rating > 0 && rating < 10, "Between 1 and 10");

        // Scale rating by 1000
        rating = rating * 1000;

        // Update the average rating of the responder using countRating and averageRating
        responders[responses[id][inferenceId].responder].averageRating = (responders[responses[id][inferenceId].responder].averageRating * responders[responses[id][inferenceId].responder].countRating + rating) / (responders[responses[id][inferenceId].responder].countRating + 1);

        // Increment the countRating
        responders[responses[id][inferenceId].responder].countRating++;

        // Mint tokens to the rating submitter
        IDecentAICoin(token).mint(msg.sender, RATING_REWARD);

        emit RatingRecieved(id, inferenceId, responses[id][inferenceId].responder, msg.sender, rating);
    }

    function safeMint(address to, string memory uri) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

}

