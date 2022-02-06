import { useState, useEffect } from "react";
import styled from "styled-components";
import colors from "../constants/colors";
import ethersService from "../services/ethersService";
import Poll from "react-polls";

export default function VotingPage() {
  const [donationAmt, setDonationAmt] = useState("0.0");
  const [roundId, setRoundId] = useState();
  const [votingResults, setVotingResults] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    ethersService
      .getVotingResults()
      .then((response) => {
        console.log("voting results:", response);
        setVotingResults(response.results);
        setRoundId(response.roundId);
      })
      .catch((error) => {
        // yolo error handling
        console.error(error);
      });
  }, []);

  /* Give up on quadratic voting cos doing sqrt in solidity is a bitch */
  // const ethToVotes = (eth) =>
  //   isNaN(parseFloat(eth))
  //     ? 0
  //     : Math.floor(Math.sqrt(2 * parseFloat(eth) * 1000));

  const ethToVotes = (eth) =>
    isNaN(parseFloat(eth)) || parseFloat(eth) < 0.001
      ? 0
      : parseFloat(eth) * 1000;

  const orgNameToId = (orgName) =>
    votingResults.find((x) => x.option === orgName).orgId;

  const handleDonationAmtChange = (event) => {
    // TODO: sanitize input
    setDonationAmt(event.target.value);
  };

  const handleVote = async (vote) => {
    try {
      await ethersService.submitVote(roundId, donationAmt, orgNameToId(vote));
      setHasVoted(true);
      const newResults = votingResults.map((org) => {
        if (org.option === vote) {
          org.votes += ethToVotes(donationAmt); // quadratic voting
        }
        return org;
      });
      setVotingResults(newResults);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <VoteInput>
        <InputLabel>Amount to donate (ETH):</InputLabel>
        <Input value={donationAmt} onChange={handleDonationAmtChange} />
        <VoteFootNote>
          {`Equivalent # of votes (0.001 ETH per vote): ${ethToVotes(
            donationAmt
          )}`}
        </VoteFootNote>
      </VoteInput>
      <PollContainer>
        <Poll
          question="Beneficiaries"
          answers={votingResults}
          onVote={handleVote}
          customStyles={{ align: "center", theme: "blue" }}
        />
        {hasVoted && (
          <PollSuccessMessage>
            {`
          You've successfully sent a voting transaction. Kindly track the
          mining status in your MetaMask wallet.
          `}
          </PollSuccessMessage>
        )}
      </PollContainer>
    </Container>
  );
}

const Container = styled.section`
  height: calc(100vh - 93px);
  background-color: ${colors.blue};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VoteInput = styled.div`
  background-color: ${colors.beige};
  border-radius: 8px;
  padding: 16px 28px;
  margin: 20px;
`;

const InputLabel = styled.label`
  font-size: 1.5rem;
  margin-right: 12px;
`;

const VoteFootNote = styled.p`
  text-align: center;
  margin-top: 8px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 1.25rem;
  text-align: center;
  border-radius: 4px;
`;

const PollContainer = styled.div`
  width: 40%;
  max-height: 70%;
  background-color: white;
  border-radius: 8px;
  overflow-y: auto;
  padding: 30px 20px;
`;

const PollSuccessMessage = styled.p`
  text-align: center;
  color: ${colors.red};
`;
