// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAgentIdentity
 * @dev Interface for ERC-8004 compatible Agent Identity.
 * Goat Network uses ERC-8004 to establish verifiable on-chain reputation for AI agents.
 */
interface IAgentIdentity {
    struct AgentProfile {
        string name;
        string description;
        address owner;
        uint256 reputationScore;
        bool isActive;
    }

    function registerAgent(string calldata name, string calldata description) external returns (bytes32 agentId);
    function getAgent(bytes32 agentId) external view returns (AgentProfile memory);
    function updateReputation(bytes32 agentId, int256 delta) external;
}
