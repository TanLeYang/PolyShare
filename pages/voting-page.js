import { useState, useEffect } from "react";
import styled from "styled-components";
import colors from "../constants/colors";
import ethersService from "../services/ethersService";
import Poll from "react-polls";

let rpcEndpoint = null;

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}

export default function VotingPage() {
  const [donationAmt, setDonationAmt] = useState("0.0");
  const [pollResults, setPollResults] = useState([]);

  useEffect(() => {
    ethersService
      .getVotingResults()
      .then((results) => setPollResults(results))
      .catch((error) => {
        // yolo error handling
        console.error(error);
      });
  }, []);

  const ethToVotes = (eth) =>
    isNaN(parseFloat(eth)) ? 0 : Math.floor(Math.sqrt(2 * parseFloat(eth)));

  const handleDonationAmtChange = (event) => {
    // TODO: sanitize input
    setDonationAmt(event.target.value);
  };

  const handleVote = (vote) => {
    ethersService.submitVote(donationAmt, vote);
    const newPollResults = pollResults.map((answer) => {
      if (answer.option === vote) {
        answer.votes += ethToVotes(donationAmt); // quadratic voting
      }
      return answer;
    });
    setPollResults(newPollResults);
    // TODO: show a message with the transaction ID or etherscan link
  };

  return (
    <Container>
      <VoteInput>
        <InputLabel>Amount to stake (ETH):</InputLabel>
        <Input value={donationAmt} onChange={handleDonationAmtChange} />
        <VoteFootNote>
          {`Equivalent # of Votes (quadratic voting): ${ethToVotes(
            donationAmt
          )}`}
        </VoteFootNote>
      </VoteInput>
      <PollContainer>
        <Poll
          question="Beneficiaries"
          answers={pollResults}
          onVote={handleVote}
          customStyles={{ align: "center", theme: "blue" }}
        />
      </PollContainer>
    </Container>
  );
}

const Container = styled.section`
  height: calc(100vh - 97px);
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
