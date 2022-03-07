import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/dist/client/router";
import Web3Modal from "web3modal";
// pinning servide to be used with ipfs
const client = ipfsHttpClient("https://ipfs.infura.io://5001/v0")

// Addresses
import { nftaddress, nftmarketaddress } from "../.config"
// ABIs
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem () {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: "", name:"", description: "" })
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
               file,
               {
                   progress: (prog) => console.log(`received: ${prog}`)
               } 
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
             
        } catch (e) {
            console.log(e)
        }
    }

    // create item and save it to ipfs
    async function createItem() {
        const { name, description, price } = formInput
        // check if all is ok
        if(!name || !description || !price || !fileUrl) return
        // stringify the data
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        // save the data to ipfs network
        try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            // after the file is uploaded to ipfs save the url in Polygon
            createSale(url)
        } catch (error) {
            console.log("Error uploading file: ", error)
        }
    }

    async function createSale() {
        
    }
}