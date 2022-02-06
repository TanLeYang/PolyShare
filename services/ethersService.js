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

  getContract() {
    if (!this.isAuthenticated()) throw new Error("No wallet connected.");
    return new ethers.Contract(votingaddress, Voting.abi, this.signer);
  }

  async getVotingResults() {
    const round = await this.getCurrentRound();
    const allOrgs = await this.getAllOrgs();

    // maps orgids to organization objects
    const orgMap = {};
    allOrgs.forEach((org) => {
      orgMap[org.orgId.toNumber()] = org;
    });

    const [, , , , , , orgs, votes, roundId] = round;
    const results = orgs.map((org, idx) => {
      const orgId = org.toNumber();
      const { orgName } = orgMap[orgId];
      const numVotes = votes[idx].toNumber();
      return {
        option: orgName,
        votes: numVotes,
        orgId,
      };
    });

    return { results, roundId: roundId.toNumber() };
  }

  async submitVote(roundId, amountInETH, orgId) {
    const wei = ethers.utils.parseEther(amountInETH);
    return this.getContract().vote(roundId, orgId, {
      value: wei,
    });
  }

  async executeVoteRound(roundId) {
    return this.getContract().executeVotingRound(roundId);
  }

  async addNewRound(description, orgs) {
    return this.getContract().newRound(description, orgs);
  }

  async getCurrentRound() {
    return this.getContract().getVotingRoundDetails();
  }

  async addNewOrg({ name, address, description }) {
    return this.getContract().addOrganization(address, name, description);
  }

  async getAllOrgs() {
    return this.getContract().getOrgsInfo();
  }

  async isUserTheOwner() {
    const ownerAddr = await this.getContract().owner();
    const userAddr = await this.signer.getAddress();
    return userAddr === ownerAddr;
  }
}

const singleton = new EthersService();
export default singleton;
