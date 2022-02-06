import { useState } from "react";
import {
  InputField,
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
  Button,
} from "../constants/styledTags";
import ethersService from "../services/ethersService";

export default function CreateItem() {
  const [formInput, updateFormInput] = useState({
    name: "",
    address: "",
    description: "",
  });
  const [newRoundDescription, setDescription] = useState("");

  const AddOrgCard = () => {
    return (
      <CardContainer>
        <Header>Add/Remove Beneficiary Organisations</Header>
        <BodyContainer>
          <SubHeader>Beneficiary Organisation Name</SubHeader>
          <InputField
            value={formInput.name}
            placeholder="Input Name"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <SubHeader>Beneficiary Organisation Wallet Address</SubHeader>
          <InputField
            value={formInput.address}
            placeholder="Input Address"
            onChange={(e) =>
              updateFormInput({ ...formInput, address: e.target.value })
            }
          />
          <SubHeader>Organisation Description</SubHeader>
          <InputField
            value={formInput.description}
            placeholder="Input Description"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <Button clickable onClick={submitNewOrg}>
            Confirm
          </Button>
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

  const submitNewOrg = async () => {
    try {
      const response = await ethersService.addNewOrg(formInput);
      console.log("Added a new org!", response);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-10/12 m-auto">
      <div className="grid grid-cols-2 gap-6 mt-5">
        <div className="bg-white p-5 rounded-lg">{AddOrgCard()}</div>
        <div>{StartStopRound()}</div>
      </div>
    </div>
  );
}
