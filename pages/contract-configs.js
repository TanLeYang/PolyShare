import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import styled from 'styled-components'
import colors from "../constants/colors";
import {
  InputField,
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
  Button,
} from "../constants/styledTags";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  const EditOrgCard = () => {
    //TODO: Actually link up with contracts
    return (
      <CardContainer>
        <Header>Add/Remove Beneficiary Organisations</Header>
        <BodyContainer>
          <SubHeader>Beneficiary Organisation Name</SubHeader>
          <InputField
            placeholder="Input Name"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <SubHeader>Beneficiary Organisation Wallet Address</SubHeader>
          <InputField
            placeholder="Input Address"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Button clickable>Confirm</Button>
        </BodyContainer>
      </CardContainer>
    );
  };

  const StartStopRound = () => {
    //TODO: Actually link up with contracts
    return (
      <div className="flex flex-col bg-white p-5 rounded-lg">
        <CardContainer>
          <Header>Start Voting Round</Header>
          <BodyContainer>
            <SubHeader>Voting Round Description</SubHeader>
            <InputField
              placeholder="Input Description"
              onChange={(e) =>
                updateFormInput({ ...formInput, name: e.target.value })
              }
            />
            <Button clickable>Start Round</Button>
          </BodyContainer>
        </CardContainer>
      </div>
    );
  };

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
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function createMarket() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    
    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    router.push('/')
  }

  return (
    <div className="w-10/12 m-auto">
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div className="bg-white p-5 rounded-lg">{EditOrgCard()}</div>
        <div>{StartStopRound()}</div>
      </div>
    </div>
  );
}