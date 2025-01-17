import { useState, useEffect } from "react";
// import styled from "styled-components";
// import colors from "../constants/colors";
import {
  CardContainer,
  Header,
  SubHeader,
  BodyContainer,
  Button,
} from "../constants/styledTags";
import ethersService from "../services/ethersService";

const CurrentRound = () => {
  const [roundDetails, setRoundDetails] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null);

  useEffect(() => {
    ethersService
      .getCurrentRound()
      .then((round) => {
        console.log("ROUND: ", round);
        setRoundDetails(round);
      })
      .catch((e) => console.error(e));
  }, []);

  const unixEpochToDateString = (epoch) => new Date(epoch * 1000).toUTCString();

  const DonationCard = () => {
    if (!roundDetails.length) return null;

    const [
      votingStart,
      votingEnd,
      totalVotesCast,
      executed,
      description,
      currStage,
      ,
      ,
      roundId
    ] = roundDetails;

    const executeRound = () => {
      const timeNow = new Date().getTime();
      if (votingEnd.toNumber() * 1000 > timeNow) {
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 3000)
        return;
      }  

      ethersService
        .executeVoteRound(roundId)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        })
    }

    const getWinner = () => {
      ethersService
        .getRoundWinner(roundId)
        .then((res) => {
          console.log(res);
          const [hasWinner, winner] = res
          setShowWinner(true);
          if (hasWinner) {
            setRoundWinner(winner);
          }
        })
    }

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
        <div className="flex mt-4">
          <Button
            className="m-4"
            onClick={executeRound}
          >
            Execute Round 
          </Button>
          <Button
            className="m-4" 
            onClick={getWinner}
          >
            Show Winner 
          </Button>
        </div>
          { showWarning && (
            <h3 className="text-red-400 text-lg">
              Woah relax, voting is still going on! 
            </h3>
          )}
        <div>
          { showWinner && roundWinner && (
            <div>Winner is {roundWinner[2]} !</div>
          )}

          { showWinner && !roundWinner && (
            <div>Voting is not over yet, cast your votes now!</div>
          )}
        </div>
      </CardContainer>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-y-3">
      <div className="col-start-2 col-span-2 mt-5 p-5 rounded-lg bg-white">
        <DonationCard/>
      </div>
    </div>
  );
};

export default CurrentRound;
