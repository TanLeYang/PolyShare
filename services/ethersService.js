import Web3Modal from "web3modal";
import { ethers } from "ethers";

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
    return !!this.provider;
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
}

const singleton = new EthersService();
export default singleton;
