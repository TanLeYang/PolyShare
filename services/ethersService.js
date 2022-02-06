import Web3Modal from "web3modal";
import { ethers } from "ethers";

import Voting from "../artifacts/contracts/Voting.sol/Voting.json";
import { votingaddress } from "../config";

class EthersService {
  provider;
  signer;

  async authenticate() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    this.provider = new ethers.providers.Web3Provider(connection);
    this.signer = this.provider.getSigner();
  }

  isAuthenticated() {
    return !!this.signer;
  }

  async getVotingResults() {
    // TODO: actual blockchain call
    // mock data:
    return [
      { option: "Red Cross", votes: 8 },
      { option: "NKF", votes: 5 },
      { option: "NKF2", votes: 2 },
      { option: "NKF3", votes: 2 },
      { option: "NKF4", votes: 0 },
      { option: "NKF5", votes: 1 },
    ];
  }

  async submitVote(donationAmount, orgId) {
    // TODO: actual blockchain call
  }

  async addNewRound(description) {
    if (!this.isAuthenticated()) throw new Error("No wallet connected.");
    const votingContract = new ethers.Contract(
      votingaddress,
      Voting.abi,
      this.signer
    );
    return votingContract.newRound(description);
  }

  async getCurrentRound() {
    if (!this.isAuthenticated()) throw new Error("No wallet connected.");
    const votingContract = new ethers.Contract(
      votingaddress,
      Voting.abi,
      this.signer
    );
    return votingContract.getVotingRoundDetails();
  }
}

const singleton = new EthersService();
export default singleton;
