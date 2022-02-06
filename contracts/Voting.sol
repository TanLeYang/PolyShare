pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";
import "hardhat/console.sol";

contract Voting is Ownable {
    using PRBMathUD60x18 for uint256;

    // TODO: Emit these events
    event VoteCast(uint voteRoundId, address voter, uint orgId, uint weight);
    event VotingStarted(uint voteRoundId);
    event VotingEnded(uint voteRoundId);
    event VoteExecuted(uint voteRoundId, address recipient, uint totalAmount);
    event AddOrganization(uint indexed pid, address orgWallet, string name, string description, address proposer);

    struct Vote {
        uint recipientOrg;
        uint weight;
        bool isExist; // Flag to differentiate between an actual vote and default empty struct in mapping
    }

    // staging -> gathering interest/registering organizations
    enum VotingStage {
        STAGING,
        IN_PROGRESS,
        ENDED,
        PAID_OUT
    }

    struct OrgInfo {
        uint orgId;
        address orgWallet;
        string orgName;
        string description;
        address proposer;
    }

    struct VotingRoundDetails {
        uint votingStart;
        uint votingEnd;
        uint totalVotesCast;
        bool executed;
        string description;
        VotingStage stage;
        uint[] orgs;
        mapping(uint => bool) participatingOrgs;
        mapping(uint => uint) votesReceived;
        mapping(address => Vote) userVotes;
    }

    OrgInfo[] public orgsInfo; // Public so that info can be queried.
    mapping(address => bool) public orgExistence; // Public so that info can be queried.
    uint voteRoundCounter = 0;
    uint stagingPeriod = 3 days;
    uint votingPeriod = 1 weeks;
    uint currentVoteRoundId = 0;
    mapping(uint => VotingRoundDetails) votingRounds;

    function getVotingRoundDetails() view external returns(
        uint,
        uint,
        uint,
        bool,
        string memory,
        string memory,
        uint[] memory,
        uint[] memory,
        uint
    ) {
        VotingRoundDetails storage currRound = votingRounds[currentVoteRoundId];
        string memory currStage;
        if (currRound.stage == VotingStage.STAGING) {
            currStage = 'Staging';
        } else if (currRound.stage == VotingStage.IN_PROGRESS) {
            currStage = 'In Progress';
        } else if (currRound.stage == VotingStage.ENDED) {
            currStage = 'Ended';
        } else if (currRound.stage == VotingStage.PAID_OUT) {
            currStage = 'Paid Out';
        }
        return (
            currRound.votingStart,
            currRound.votingEnd,
            currRound.totalVotesCast,
            currRound.executed,
            currRound.description,
            currStage,
            currRound.orgs,
            compileVotesReceived(currRound),
            currentVoteRoundId
        );
    }

    // helper fn to convert VotingRoundDetails.votesRecevied into an indexable array to return
    function compileVotesReceived(VotingRoundDetails storage _round) internal view returns (uint[] memory) {
        uint[] memory votesReceived = new uint[](_round.orgs.length);
        for (uint i = 0; i < _round.orgs.length; i++) {
            uint orgId = _round.orgs[i];
            votesReceived[i] = _round.votesReceived[orgId];
        }
        return votesReceived;
    }

    // Start a new round of voting, description can be used to describe the
    // category of organizations taking part, e.g "Animals" or "Elderly" (?)
    // For now only owner can start a new round
    function newRound(string memory _description, uint[] memory _orgIds) external onlyOwner() {
        voteRoundCounter++;
        uint newRoundId = voteRoundCounter;
        currentVoteRoundId = newRoundId;
        uint voteStartTime = block.timestamp + stagingPeriod;

        votingRounds[newRoundId].votingStart = voteStartTime;
        votingRounds[newRoundId].votingEnd = voteStartTime + votingPeriod;
        votingRounds[newRoundId].description = _description;
        votingRounds[newRoundId].stage = VotingStage.IN_PROGRESS;
        votingRounds[newRoundId].orgs = _orgIds;

        for (uint i = 0; i < _orgIds.length; i++) {
            uint orgId = _orgIds[i];
            votingRounds[newRoundId].participatingOrgs[orgId] = true;
            votingRounds[newRoundId].votesReceived[orgId] = 0;
        }
    }

    // DEPRECATED? Owner should specify a list of orgs when creating the round since we're skipping staging.
    function registerOrg(uint _voteRoundId, uint _orgId) external onlyOwner() {
        require(votingRounds[_voteRoundId].stage == VotingStage.STAGING, "Orgs can only be registered during the staging period");
        votingRounds[_voteRoundId].orgs.push(_orgId);
        votingRounds[_voteRoundId].participatingOrgs[_orgId] = true;
    }

    // TODO: How to accept donation?
    // Make the vote function itself payable? make user exchange for token?
    function vote(uint _voteRoundId, uint _orgId) payable external {
        require(votingRounds[_voteRoundId].stage == VotingStage.IN_PROGRESS, "Votes can only be cast if voting is still in progress");
        require(_canVote(_voteRoundId, msg.sender), "User not allowed to vote in this round");
        require(_isValidOrg(_voteRoundId, _orgId), "Not a valid organization id");

        VotingRoundDetails storage currRound = votingRounds[_voteRoundId];

        /* fkin give up on quadratic voting cos idk how to use the library's sqrt */
        // uint voteWeight = (2 * (msg.value / conversionFactor)).sqrt(); // quadratic voting

        uint conversionFactor = 10 ** 15; // convert wei to units of 0.001 ether (not 1 ether)
        // That means 1 vote costs 0.001 ETH, which is somewhat reasonable
        uint voteWeight = msg.value / conversionFactor;
        currRound.userVotes[msg.sender] = Vote(_orgId, voteWeight, true);
        currRound.votesReceived[_orgId] += voteWeight;
        currRound.totalVotesCast += voteWeight;
    }

    function executeVotingRound(uint _voteRoundId) external view returns(bool) {
        VotingRoundDetails storage voteRound = votingRounds[_voteRoundId];
        require(voteRound.stage == VotingStage.ENDED, "Can only execute after a voting round has ended");

        uint winningOrg = _getMostVotedOrg(_voteRoundId);
        // TODO: Send the payment here
        return true;
    }

    function _getMostVotedOrg(uint _voteRoundId) private view returns(uint) {
        VotingRoundDetails storage votingDetails = votingRounds[_voteRoundId];
        uint winningOrgId;
        uint maxScore;
        for (uint i = 0; i < votingDetails.orgs.length; i++) {
            uint currOrg = votingDetails.orgs[i];
            if (votingDetails.votesReceived[currOrg] > maxScore) {
                winningOrgId = currOrg;
                maxScore = votingDetails.votesReceived[currOrg];
            }
        }

        return winningOrgId;
    }

    function _canVote(uint _voteRoundId, address _user) private pure returns(bool) {
        // TODO: Implement voting permission check
        return _voteRoundId == _voteRoundId && _user == _user;
    }

    function _hasNotVoted(uint _voteRoundId, address _user) private view returns(bool) {
        return !votingRounds[_voteRoundId].userVotes[_user].isExist;
    }

    function _isValidOrg(uint _voteRoundId, uint _orgId) private view returns(bool) {
        return votingRounds[_voteRoundId].participatingOrgs[_orgId];
    }

    modifier nonDuplicated(address _orgWallet) {
        require(orgExistence[_orgWallet] == false, "Org wallet is duplicated");
        _;
    }

    function addOrganization(address _orgWallet, string memory _orgName, string memory _description) external nonDuplicated(_orgWallet) {
        orgsInfo.push(
            OrgInfo({
                orgId: orgsInfo.length,
                orgWallet: _orgWallet,
                orgName: _orgName,
                description: _description,
                proposer: msg.sender
            }));
        orgExistence[_orgWallet] = true;
        emit AddOrganization(orgsInfo.length, _orgWallet, _orgName, _description, msg.sender);
    }

    function getOrgsInfo() external view returns (OrgInfo[] memory) {
        return orgsInfo;
    }
}
