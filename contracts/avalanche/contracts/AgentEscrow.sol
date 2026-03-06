// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentEscrow is Ownable {
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

    constructor(address _acceptedToken, address initialOwner) Ownable(initialOwner) {
        acceptedToken = IERC20(_acceptedToken);
    }

    function createJob(address agentWallet, uint256 amount) external {
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

    function completeJob(uint256 jobId) external onlyOwner {
        Job storage job = jobs[jobId];
        require(!job.isCompleted && !job.isRefunded, "Job already resolved");

        job.isCompleted = true;
        require(acceptedToken.transfer(job.agentWallet, job.amount), "Transfer failed");

        emit JobCompleted(jobId);
    }

    function refundJob(uint256 jobId) external onlyOwner {
        Job storage job = jobs[jobId];
        require(!job.isCompleted && !job.isRefunded, "Job already resolved");

        job.isRefunded = true;
        require(acceptedToken.transfer(job.employer, job.amount), "Transfer failed");

        emit JobRefunded(jobId);
    }
}
