/* eslint-disable @next/next/no-img-element */
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"
// Addresses
import { nftaddress, nftmarketaddress } from "../.config"
// ABIs
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")

  useEffect(() => {
    loadNFTs()
  }, [])

  // talk to the smart contract and load the NFTs
  async function loadNFTs() {
    // since we do not care about the user we can use the standard provider
    const provider = new ethers.providers.JsonRpcProvider()
    // configure the NFTcontract
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    // configure the Marketcontract
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    // get the data
    const data = await marketContract.fetchMarketItems()
    console.log("data", data)
    // map over all the items
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      // we get all the metadata from ifp system
      const meta = await axios.get(tokenUri)
      // format the price not to be in wei (too long otherwise)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }))
    // update the nfts in the state
    setNfts(items)
    // change the loading state
    setLoadingState("loaded")

  }

  async function buyNFT(nft) {
    // get a hold of the user's wallet in the browser
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    // after we confirm the wallet we need him to sign the transaction
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    // reference to the price
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    // create the transaction from the Market contract
    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, { value: price })
    // await until the transaction is completed
    await transaction.wait()
    // reload the screen so that the NFT just sold is no longer there
    loadNFTs()
  }


  if (loadingState === "loaded" && !nfts.length) {
    return (
      <h1 className="px-20 py-10 text-3xl">No items in the marketplace</h1>
      )
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px"}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} alt="NFT"/>
                <div className="p-4">
                  <p className="h-[64px] text-2xl font-semibold">{nft.name}</p>
                  <div className="h-[70px] overflow-hidden">
                    <p className="text-gray-400">{nft.description}</p>
                  </div>  
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} Matic</p>
                  <button 
                    className="w-full bg-green-500 text-white fond-bold py-2 px-12 rounded"
                    onClick={() => buyNFt(nft)}
                  >
                    Buy  
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}