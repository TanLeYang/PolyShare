import { useState, useEffect } from "react";
// import styled from "styled-components";
// import colors from "../constants/colors";
import {
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
} from "../constants/styledTags";
import ethersService from "../services/ethersService";

const CreatePool = () => {
  const [roundDetails, setRoundDetails] = useState([]);

  useEffect(() => {
    ethersService
      .getCurrentRound()
      .then((round) => {
        console.log("ROUND: ", round);
        setRoundDetails(round);
      })
      .catch((e) => console.error(e));
  }, []);

  const unixEpochToDateString = (epoch) =>
    new Date(epoch * 1000).toLocaleTimeString();

  const DonationCard = () => {
    if (!roundDetails.length) return null;

    const [
      votingStart,
      votingEnd,
      totalVotesCast,
      executed,
      description,
      currStage,
    ] = roundDetails;
    return (
      <CardContainer>
        <Header>{description}</Header>
        <BodyContainer>
          <SubHeader>
            Start Time: {unixEpochToDateString(votingStart.toNumber())}
          </SubHeader>
          <SubHeader>
            End Time: {unixEpochToDateString(votingEnd.toNumber())}
          </SubHeader>
          <SubHeader>{`Total Votes Cast: ${totalVotesCast.toString()}`}</SubHeader>
          {/* <SubHeader>Your Donated Amount (ETH):</SubHeader> */}
          {/* <SubHeader>Your Vote Weight (%):</SubHeader> */}
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
