import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  InputField,
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
  Button,
} from "../constants/styledTags";
import Select from "react-select";
import ethersService from "../services/ethersService";

export default function ContractConfigs() {
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgs, setSelectedOrgs] = useState([]);
  const [formInput, updateFormInput] = useState({
    name: "",
    address: "",
    description: "",
  });
  const [newRoundDescription, setDescription] = useState("");

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = () => {
    ethersService
      .getAllOrgs()
      .then((orgs) => {
        console.log("ORGS: ", orgs);
        setOrgs(orgs);
      })
      .catch((e) => console.error(e));
  };

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
            <SubHeader>Voting Round Beneficiaries</SubHeader>
            <Select
              value={selectedOrgs}
              isMulti
              options={getOrgOptions()}
              onChange={setSelectedOrgs}
            />
            <Refresh onClick={fetchOrgs}>Refresh</Refresh>
            <Button clickable onClick={submitNewRound}>
              Start Round
            </Button>
          </BodyContainer>
        </CardContainer>
      </div>
    );
  };

  const getOrgOptions = () =>
    orgs.map((org) => ({ value: org.orgId.toNumber(), label: org.orgName }));

  const submitNewRound = async () => {
    try {
      const selectedOrgIds = selectedOrgs.map((org) => org.value);
      const response = await ethersService.addNewRound(
        newRoundDescription,
        selectedOrgIds
      );
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

const Refresh = styled.a`
  font-size: 0.75rem;
  margin-top: -15px;
  cursor: pointer;
  text-decoration: underline;
`;
