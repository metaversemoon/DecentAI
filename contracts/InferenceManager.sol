//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.9;

// We import this library to be able to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DecentralizedAI.sol";

contract InferenceManager is Ownable {

    struct Request {
        uint256 start;
        uint8 countInferences;
        uint256 offer;
        address responder;
        bool paid;
    }

    uint256 public constant MAX_INFERENCES = 10;
    uint256 public requestId = 0;

    // Requests are stored in a mapping
    mapping(uint256 => Request) public requests;

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
    event ResponderAdded(address indexed responder, uint256 cost);

    // Event is added when a responser is removed
    event ResponderRemoved(address indexed responder);

    // Event to fire when rating is recieved
    event RatingRecieved( uint256 requestId, uint256 inferenceId, address indexed responder, address indexed rater, uint256 rating);

    // ERC20 token address
    address public token;
    bool public isTokenSet;

    // Constant for amount minted per rating
    uint256 public constant RATING_REWARD = 5;

    constructor() {}

    // Set the token address
    function setToken(address _token) public onlyOwner {
        require(isTokenSet == false, "Token address is already set");
        token = _token;
        isTokenSet = true;
    }


    // Add a request
    function requestInference(string calldata prompt, address responder, uint256 offer) public {
        // require(offer > 0, "Offer must be greater than 0");
        requestId++;
        requests[requestId] = Request(block.timestamp, 0, offer, responder, false);

        // Transfer the required cost in ERC20 tokens to the contract // TODO think about withdrawal
        IERC20(token).transferFrom(msg.sender, address(this), offer);

        emit RequestRecieved(msg.sender, requestId, prompt, offer, responder);

    }

    // Add a response
    function recieveInference(uint256 id, string memory url) public {
        require(responders[msg.sender].active, "Responder is not active");
        require(requests[id].start > 0, "Request does not exist");
        require(requests[id].countInferences < MAX_INFERENCES, "Request has reached max inferences");
        require(((requests[id].responder != address(0x0)) && (requests[id].responder == msg.sender)), "Responder is not the responder for this request");

        responses[id].push(Response(url, msg.sender));
        requests[id].countInferences++;
        responders[msg.sender].countInferences++;

        // Transfer the cost to the first legal responder
        if (requests[id].paid == false) {
            IERC20(token).transferFrom(address(this), msg.sender, requests[id].offer);
            requests[id].paid = true;
        }
        
        // The other responders can submit results as well to 
        // a. build up a profile
        // b. get user ratings

        emit ResponseRecieved(id, msg.sender, url);

    }

    // Register a responder
    function registerResponder(uint256 cost) public {
        responders[msg.sender] = Responder(true, 0, 0, 0, cost);
        emit ResponderAdded(msg.sender, cost);
    }

    // Remove a responder 
    function removeResponder(address responder) public onlyOwner {
        responders[responder].active = false;
        emit ResponderRemoved(responder);
    }

    // Accept user scoring of inference
    function rateInference(uint256 id, uint256 inferenceId, uint256 rating) public {
        require(responses[id].length >= inferenceId, "No such responses for request");
        require(rating > 0 && rating < 10, "rating must be between 1 and 10");

        // Scale rating by 1000
        rating = rating * 1000;

        // Update the average rating of the responder using countRating and averageRating
        responders[responses[id][inferenceId].responder].averageRating = (responders[responses[id][inferenceId].responder].averageRating * responders[responses[id][inferenceId].responder].countRating + rating) / (responders[responses[id][inferenceId].responder].countRating + 1);

        // Increment the countRating
        responders[responses[id][inferenceId].responder].countRating++;

        // Mint tokens to the rating submitter
        DecentralizedAI(token).mint(msg.sender, RATING_REWARD);

        emit RatingRecieved(id, inferenceId, responses[id][inferenceId].responder, msg.sender, rating);
    }

}

