// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
// this allows to prevent multiple transation to the marketplace from external contracts
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    // we need to keep track of the number of item sold so we can differentiate the items
    Counters.Counter private _itemsSold;
    // this is to give a commission to the original owner of the NFT
    address payable owner;
    // we will deploy actually in MATIC on Polygon but the number works the same as ether (little confusing)
    // this is as if we wrote 0.025 MATIC for listing fee, which is around 2-4cents with matic arond 1-2$
    uint256 listingPrice = 0.025 ether;

    // the owner of the contract is whoever deployes it
    constructor() {
        owner = payable(msg.sender);
    }

    // we set all the properties that the MarketItem needs to have (symilar to an object {})
    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // we keep track of all the items that will be created, the uint will be the itemId returns a market object
    mapping(uint256 => MarketItem) private idToMarketItem;

    // emitting an event for once a new market item is created and we can listen to it in the front end
    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address payable seller,
        address payable owner,
        uint256 price,
        bool sold
    );

    // function that returns the market price for the item
    function getListingPrice() public view returns(uint256) {
        return listingPrice;
    }

    // create a marketItem and putting it up for sale, takes the contract from the NFT.sol 
    // pass in the tokenId from NFT.sol and the price defined by the seller
    // also we prevent a reenetry attack
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        // ususally the minimum price should be 0.01eth or around 5 MATICS
        require(price > 5 ether, "Price must be at least 1wei");
        // I need to send along some payments equal to the listing price to pay for the listing
        require(msg.value == listingPrice, "Price mist be equal to listing price");
        // increment the itemId
        _itemIds.increment();
        // keep track of the current itemId
        uint itemId = _itemIds.current();
        // add the marketItem to the mapping and create the current marketItem
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender), //seller
            payable(address(0)), //owner right now is noone and is a empty address
            price, //from the argument
            false //currently has not been sold yet
        );

        // the contract takes ownership of this item until it is sold
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    ) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        require(msg.value == price, "Please submit the asking price in order to complete the transaction");
        // sent the asking price to the seller
        idToMarketItem[itemId].seller.transfer(msg.value);
        // transfering the ownershit of the token to the buyer 
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        // change the bool value of sold to be true
        idToMarketItem[itemId].sold = true;
        // increment the number of item sold
        _itemsSold.increment();
        // pay the owner of the contract
        payable(owner).transfer(listingPrice);

    }

    // view function to get all the items that are not sold yet
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        // all items in the market
        uint itemCount = _itemIds.current();
        // check how many items are still unsold
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();

        uint currentIndex = 0;
        // create a new MarketItem array called items and set the lenght to the number of unsoldItems
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            // check if item is unsold (has an address empty 0)
            if (idToMarketItem[i + 1].owner == address(0)) {
                // item that we are interacting with right now
                uint currentId = idToMarketItem[i + 1].itemId;
                // get the mapping with the current id that we want to add to the array
                MarketItem storage currentItem = idToMarketItem[currentId];
                // insert item into the array
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

}