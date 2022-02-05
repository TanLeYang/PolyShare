// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.11;

contract DAOInterface {
    // Denotes the maximum proposal deposit that can be given. It is given as
    // a fraction of total Ether spent plus balance of the DAO
    uint256 constant maxDepositDivisor = 100;

    //PolyToken contract
    PolyToken token; // TODO: Add the Token we are using

    // Proposals to donate the DAO's ether
    Proposal[] public proposals;

    // Maps orgId to
    mapping(uint256 => bool) participatingOrgs;

    // Address of the curator
    address public curator;

    // The whitelist: List of addresses the DAO is allowed to send ether to
    mapping(address => bool) public allowedRecipients;

    // Map of addresses and proposal voted on by this address
    mapping(address => uint256[]) public votingRegister;

    // The minimum deposit (in wei) required to submit any proposal that is not
    // requesting a new Curator (no deposit is required for splits)
    uint256 public proposalDeposit;

    // the accumulated sum of all current proposal deposits
    uint256 sumOfProposalDeposits;

    // A proposal with `newCurator == false` represents a transaction
    // to be issued by this DAO
    // A proposal with `newCurator == true` represents a DAO split
    struct Proposal {
        // The address where the `amount` will go to if the proposal is accepted
        address recipient;
        // The amount to transfer to `recipient` if the proposal is accepted.
        uint256 amount;
        // A plain text description of the proposal
        string description;
        // A unix timestamp, denoting the end of the voting period
        uint256 votingDeadline;
        // True if the proposal's votes have yet to be counted, otherwise False
        bool open;
        // True if the votes have been counted, and
        // the majority said yes
        bool proposalPassed;
        // Deposit in wei the creator added when submitting their proposal. It
        // is taken from the msg.value of a newProposal call.
        uint256 proposalDeposit;
        // Number of Tokens in favor of the proposal
        uint256 yea;
        // Number of Tokens opposed to the proposal
        uint256 nay;
        // Simple mapping to check if a shareholder has voted for it
        mapping(address => bool) votedYes;
        // Simple mapping to check if a shareholder has voted against it
        mapping(address => bool) votedNo;
        // Address of the shareholder who created the proposal
        address creator;
    }

    /// @notice `msg.sender` creates a proposal to send `_amount` Wei to
    /// `_recipient`.
    /// @param _recipient Address of the recipient of the proposed transaction
    /// @param _description String describing the proposal
    /// @param _donationPeriod Time used for raising a donation
    /// @return The proposal ID. Needed for voting on the proposal
    function newProposal(
        address _recipient,
        string _description,
        uint256 _donationPeriod
    ) public payable returns (uint256 _proposalID);

    /// @notice Vote on proposal `_proposalID` with `_supportsProposal`
    /// @param _proposalID The proposal ID
    /// @param _supportsProposal Yes/No - support of the proposal
    function vote(uint256 _proposalID, bool _supportsProposal) external;

    /// @notice Checks whether proposal `_proposalID` has been voted for or rejected, and executes the
    /// transaction in the case it has been voted for.
    /// @param _proposalID The proposal ID
    /// @return Whether the proposed transaction has been executed or not
    function executeProposal(uint256 _proposalID)
        public
        returns (bool _success);

    /// @notice Change the minimum deposit required to submit a proposal
    /// @param _proposalDeposit The new proposal deposit
    /// @dev Can only be called by this DAO (through proposals with the
    /// recipient being this DAO itself)
    function changeProposalDeposit(uint256 _proposalDeposit) external;

    /// @return total number of proposals ever created
    function numberOfProposals()
        public
        view
        returns (uint256 _numberOfProposals);

    event ProposalAdded(
        uint256 indexed proposalID,
        address recipient,
        uint256 amount,
        string description
    );
    event Voted(
        uint256 indexed proposalID,
        bool position,
        address indexed voter
    );
    event ProposalTallied(uint256 indexed proposalID, bool result);
    event AllowedRecipientChanged(address indexed _recipient, bool _allowed);
}

// The DAO contract itself
contract DAO is DAOInterface {
    // Modifier that allows only shareholders to vote and create new proposals
    modifier onlyTokenholders() {
        require(token.balanceOf(msg.sender) == 0);
        _;
    }

    constructor(
        address _curator,
        uint256 _proposalDeposit,
        PolyToken _token
    ) public {
        token = _token;
        curator = _curator;
        proposalDeposit = _proposalDeposit;
        proposals.length = 1; // avoids a proposal with ID 0 because it is used

        allowedRecipients[address(this)] = true;
        allowedRecipients[curator] = true;
    }

    function newProposal(
        address _recipient,
        string _description,
        uint64 _donationPeriod
    ) public payable onlyTokenholders returns (uint256 _proposalID) {
        require(
            !allowedRecipients[_recipient] ||
                _donationPeriod < minProposalDebatePeriod ||
                _donationPeriod > 8 weeks ||
                msg.value < proposalDeposit ||
                msg.sender == address(this) //to prevent a 51% attacker to convert the ether into deposit
        );

        _proposalID = proposals.length++;
        Proposal p = proposals[_proposalID];
        p.recipient = _recipient;
        p.amount = _amount;
        p.description = _description;
        p.votingDeadline = now + _donationPeriod;
        p.open = true;
        p.proposalPassed = false;
        p.creator = msg.sender;
        p.proposalDeposit = msg.value;

        allowedRecipients[_recipient] = true; // Add organization to allowedRecipients
        participatingOrgs[_proposalID] = true; // Add orgId to participatingOrgs

        sumOfProposalDeposits += msg.value;

        ProposalAdded(_proposalID, _recipient, _amount, _description);
    }

    function vote(uint256 _proposalID, bool _supportsProposal) external {
        Proposal p = proposals[_proposalID];

        unVote(_proposalID);

        if (_supportsProposal) {
            p.yea += token.balanceOf(msg.sender);
            p.votedYes[msg.sender] = true;
        } else {
            p.nay += token.balanceOf(msg.sender);
            p.votedNo[msg.sender] = true;
        }

        votingRegister[msg.sender].push(_proposalID);
        Voted(_proposalID, _supportsProposal, msg.sender);
    }

    function unVote(uint256 _proposalID) external {
        Proposal p = proposals[_proposalID];

        require(now >= p.votingDeadline);

        if (p.votedYes[msg.sender]) {
            p.yea -= token.balanceOf(msg.sender);
            p.votedYes[msg.sender] = false;
        }

        if (p.votedNo[msg.sender]) {
            p.nay -= token.balanceOf(msg.sender);
            p.votedNo[msg.sender] = false;
        }
    }

    function unVoteAll() internal {
        // DANGEROUS loop with dynamic length - needs improvement
        for (uint256 i = 0; i < votingRegister[msg.sender].length; i++) {
            Proposal p = proposals[votingRegister[msg.sender][i]];
            if (now < p.votingDeadline) unVote(i);
        }

        votingRegister[msg.sender].length = 0;
    }

    function executeProposal(uint256 _proposalID)
        external
        returns (bool _success)
    {
        Proposal p = proposals[_proposalID];

        // If we are over deadline and waiting period, assert proposal is closed
        if (p.open && now > p.votingDeadline + executeProposalPeriod) {
            closeProposal(_proposalID);
            return;
        }

        // Check if the proposal can be executed
        require(
            now < p.votingDeadline || // has the voting deadline arrived?
                // Have the votes been counted?
                !p.open ||
                p.proposalPassed || // anyone trying to call us recursively?
                // Does the transaction code match the proposal?
                p.proposalHash != sha3(p.recipient, p.amount)
        );

        // If the curator removed the recipient from the whitelist, close the proposal
        // in order to free the deposit and allow unblocking of voters
        if (!allowedRecipients[p.recipient]) {
            closeProposal(_proposalID);
            // the return value is not checked to prevent a malicious creator
            // from delaying the closing of the proposal
            p.creator.send(p.proposalDeposit);
            return;
        }

        bool proposalCheck = true;

        if (p.amount > actualBalance()) proposalCheck = false;

        // Execute result
        if (p.yea > p.nay && proposalCheck) {
            // we are setting this here before the CALL() value transfer to
            // assure that in the case of a malicious recipient contract trying
            // to call executeProposal() recursively money can't be transferred
            // multiple times out of the DAO
            p.proposalPassed = true;

            // this call is as generic as any transaction. It sends all gas and
            // can do everything a transaction can do. It can be used to reenter
            // the DAO. The `p.proposalPassed` variable prevents the call from
            // reaching this line again
            require(!p.recipient.call.value(p.amount));

            _success = true;
        }

        closeProposal(_proposalID);

        // Initiate event
        ProposalTallied(_proposalID, _success);
    }

    function closeProposal(uint256 _proposalID) internal {
        Proposal p = proposals[_proposalID];
        if (p.open) sumOfProposalDeposits -= p.proposalDeposit;
        p.open = false;
    }

    function changeProposalDeposit(uint256 _proposalDeposit) external {
        require(
            msg.sender != address(this) ||
                _proposalDeposit > (actualBalance()) / maxDepositDivisor
        );
        proposalDeposit = _proposalDeposit;
    }

    function actualBalance() internal view returns (uint256 _actualBalance) {
        return this.balance - sumOfProposalDeposits;
    }

    function numberOfProposals()
        external
        view
        returns (uint256 _numberOfProposals)
    {
        // Don't count index 0. It's used by getOrModifyBlocked() and exists from start
        return proposals.length - 1;
    }
}
