// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AgentEscrow is 
    Initializable, 
    AccessControlUpgradeable, 
    ReentrancyGuardTransient, 
    PausableUpgradeable, 
    UUPSUpgradeable 
{
    bytes32 public constant ESCROW_MANAGER_ROLE = keccak256("ESCROW_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    IERC20 public acceptedToken;

    struct Job {
        address employer;
        address agentWallet;
        uint256 amount;
        bool isCompleted;
        bool isRefunded;
    }

    mapping(uint256 => Job) public jobs;
    uint256 public nextJobId;

    event JobCreated(uint256 indexed jobId, address indexed employer, address indexed agentWallet, uint256 amount);
    event JobCompleted(uint256 indexed jobId);
    event JobRefunded(uint256 indexed jobId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _acceptedToken, address defaultAdmin) initializer public {
        __AccessControl_init();
        __Pausable_init();

        acceptedToken = IERC20(_acceptedToken);

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ESCROW_MANAGER_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, defaultAdmin);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function createJob(address agentWallet, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than zero");
        
        // Transfer tokens from employer to this contract
        require(acceptedToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            employer: msg.sender,
            agentWallet: agentWallet,
            amount: amount,
            isCompleted: false,
            isRefunded: false
        });

        emit JobCreated(jobId, msg.sender, agentWallet, amount);
    }

    function completeJob(uint256 jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[jobId];
        require(!job.isCompleted && !job.isRefunded, "Job already resolved");
        
        // Only the employer or the ESCROW_MANAGER can complete the job
        require(msg.sender == job.employer || hasRole(ESCROW_MANAGER_ROLE, msg.sender), "Not authorized to complete job");

        job.isCompleted = true;
        require(acceptedToken.transfer(job.agentWallet, job.amount), "Transfer failed");

        emit JobCompleted(jobId);
    }

    function refundJob(uint256 jobId) external nonReentrant whenNotPaused {
        Job storage job = jobs[jobId];
        require(!job.isCompleted && !job.isRefunded, "Job already resolved");

        // Only the agent or the ESCROW_MANAGER can authorize a refund back to the employer
        require(msg.sender == job.agentWallet || hasRole(ESCROW_MANAGER_ROLE, msg.sender), "Not authorized to refund job");

        job.isRefunded = true;
        require(acceptedToken.transfer(job.employer, job.amount), "Transfer failed");

        emit JobRefunded(jobId);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}
}
