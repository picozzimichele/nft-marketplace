const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    // get a reference to the market contract
    const Market = await ethers.getContractFactory("NFTMarket");
    // get the market and wait for it to be deployed
    const market = await Market.deploy();
    await market.deployed()
    const marketAddress = market.address

    // now we get a reference and deploy the NFT contract
    const NFT = await ethers.getContractFactory("NFT")
    // deploy the contract with the Market Address from the other contract above
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address

    let listingPrice = await market.getListingPrice()
    // we neet to convert it to string to interact with it
    listingPrice = listingPrice.toString()
    // price of the sale in MATIC
    const auctionPrice = ethers.utils.parseUnits("100", "ether")

    // create two test nft tokens passing the URL
    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")

    // create the two listings for the above nfts
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice })    
    
    // you can destructure here as many items as you need, we do not want to be the buyer to be the same as the seller
    const [_, buyerAddress] = await ethers.getSigners()
    // we use the buyer Address to connect to the market and create the sale for 100 MATICS
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice })

    let items = await market.fetchMarketItems()
    // we loop over the items to make them more human readable
    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId)
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item
    }))

    console.log("items", items)

  });
});
