import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import styled from 'styled-components'
import colors from "../constants/colors";

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

const InputField = styled.input.attrs({
  className: 'w-full border rounded p-4'
})``;

const DonationContainer = styled.div.attrs({
  classname: 'p-5 rounded-lg mt-5 bg-white'
})``;

const DonationDesc = styled.div.attrs({
  className: 'flex text-2xl font-bold text-redC'
})``;

const DonationBody = styled.div.attrs({
  className: 'flex flex-col text-xl font-bold gap-y-5 mt-5'
})``;

const DonationSubTitles = styled.div.attrs({
  className: 'font-lg text-orangeC font-bold'
})``;

const Button = styled.button`
  background-color: ${(props) =>
    props.clickable ? colors.blue : colors.yellow};
  color: ${(props) => (props.clickable ? "white" : "black")};
  border-radius: 6px;
  padding: 8px 20px;

  &:hover {
    opacity: ${(props) => (props.clickable ? 0.6 : 1)};
  }
  transition: opacity 0.15s;
`;

const CreatePool = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  const DonationCard = () => {
    // TODO: Get actual donation details from contract
    return (
      <DonationContainer>
        <DonationDesc>Sam's XMM Cafe Fund</DonationDesc>
        <DonationBody>
          <DonationSubTitles>Start Time:</DonationSubTitles>
          <DonationSubTitles>End Time:</DonationSubTitles>
          <DonationSubTitles>Current Pool Value (ETH):</DonationSubTitles>
          <DonationSubTitles>Current Pool Value (US$):</DonationSubTitles>
          <InputField
            placeholder="Enter Amount to Donate"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Button clickable>Submit Donation</Button>
        </DonationBody>
      </DonationContainer>
    );
  };

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createMarket() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="grid grid-cols-4 gap-y-3">
      <div className="col-start-2 col-span-2 mt-5 p-5 rounded-lg bg-white">
        {DonationCard()}
      </div>
    </div>
  );
};

export default CreatePool;