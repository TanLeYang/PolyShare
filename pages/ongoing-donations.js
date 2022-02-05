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

import Voting from '../artifacts/contracts/Voting.sol/Voting.json'

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
      <CardContainer>
        <Header>Sam's XMM Cafe Fund</Header>
        <BodyContainer>
          <SubHeader>Start Time:</SubHeader>
          <SubHeader>End Time:</SubHeader>
          <SubHeader>Current Pool Value (ETH):</SubHeader>
          <SubHeader>Your Donated Amount (ETH):</SubHeader>
          <SubHeader>Your Vote Weight (%):</SubHeader>
          <InputField
            placeholder="Enter Amount to Donate"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <Button clickable>Submit Donation</Button>
        </BodyContainer>
      </CardContainer>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-y-3">
      <div className="col-start-2 col-span-2 mt-5 p-5 rounded-lg bg-white">
        {DonationCard()}
      </div>
    </div>
  );
};

export default CreatePool;