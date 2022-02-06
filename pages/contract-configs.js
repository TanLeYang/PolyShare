import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import styled from "styled-components";
import colors from "../constants/colors";
import {
  InputField,
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
  Button,
} from "../constants/styledTags";
import ethersService from "../services/ethersService";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/Market.sol/NFTMarket.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [newRoundDescription, setDescription] = useState("");
  const router = useRouter();

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
    return (
      <div className="flex flex-col bg-white p-5 rounded-lg">
        <CardContainer>
          <Header>Start Voting Round</Header>
          <BodyContainer>
            <SubHeader>Voting Round Description</SubHeader>
            <InputField
              value={newRoundDescription}
              placeholder="Input Description"
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button clickable onClick={submitNewRound}>
              Start Round
            </Button>
          </BodyContainer>
        </CardContainer>
      </div>
    );
  };

  const submitNewRound = async () => {
    try {
      const response = await ethersService.addNewRound(newRoundDescription);
      console.log("Created a new round!", response);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-10/12 m-auto">
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div className="bg-white p-5 rounded-lg">{EditOrgCard()}</div>
        <div>{StartStopRound()}</div>
      </div>
    </div>
  );
}
