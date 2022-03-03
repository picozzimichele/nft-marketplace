// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    // allows to keep track of the id of each token once minted (1, 2, 3 etc)
    Counters.Counter private _tokenIds;
    // this is the address of the marketplace where the NFT interact with
    address contractAddress;

    // when we deploy the contract we need to give it the marketplace address
    // fist we will deploy the NFTMarket then we pass the address into this constructor
    constructor(address marketplaceAddress) ERC721("Degenverse Tokens", "DGTT") {
        contractAddress = marketplaceAddress;
    }

    // this function is to mind new tokens and we need just to pass the URI(Uniform Resource Identifier)
    // we basically need to pass a URL for the token
    function createToken(string memory tokenURI) public returns (uint) {
        // first thing we increment the tokenId count
        _tokenIds.increment();
        // create a new variable that will take the current tokenId number
        uint256 newItemId = _tokenIds.current();
        // we need to mint the token passing the address of the person that calls the function
        // and the itemId of the token
        _mint(msg.sender, newItemId);
        // from the ERC721URIStorage we call this method to set the URI
        _setTokenURI(newItemId, tokenURI);
        // we want to set the approvall to true. This will give the address of the marketpalce to transact
        // the tokens between the different users in another contract
        setApprovalForAll(contractAddress, true);
        // for the front end application we return the itemId
        return newItemId;
    }
}