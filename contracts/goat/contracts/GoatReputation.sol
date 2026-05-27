// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IAgentIdentity.sol";

/**
 * @title GoatReputation
 * @dev Implementation of ERC-8004 for Goat Network.
 * This contract serves as the on-chain registry for AI Agents (Scouts, Managers)
 * on the Goat Bitcoin L2. It inherits Bitcoin-native security via BitVM2.
 */
contract GoatReputation is 
    Initializable, 
    AccessControlUpgradeable, 
    UUPSUpgradeable,
    IAgentIdentity 
{
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    mapping(bytes32 => AgentProfile) public agents;
    mapping(address => bytes32) public walletToAgent;

    event AgentRegistered(bytes32 indexed agentId, string name, address indexed owner);
    event ReputationUpdated(bytes32 indexed agentId, uint256 newScore, int256 delta);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin) initializer public {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MANAGER_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, defaultAdmin);
    }

    function registerAgent(string calldata name, string calldata description) external returns (bytes32 agentId) {
        agentId = keccak256(abi.encodePacked(msg.sender, name, block.timestamp));
        require(!agents[agentId].isActive, "Agent ID collision");

        agents[agentId] = AgentProfile({
            name: name,
            description: description,
            owner: msg.sender,
            reputationScore: 100, // Initial trust score
            isActive: true
        });

        walletToAgent[msg.sender] = agentId;

        emit AgentRegistered(agentId, name, msg.sender);
    }

    function getAgent(bytes32 agentId) external view returns (AgentProfile memory) {
        require(agents[agentId].isActive, "Agent not found");
        return agents[agentId];
    }

    function updateReputation(bytes32 agentId, int256 delta) external onlyRole(MANAGER_ROLE) {
        require(agents[agentId].isActive, "Agent not found");
        
        uint256 oldScore = agents[agentId].reputationScore;
        if (delta > 0) {
            agents[agentId].reputationScore += uint256(delta);
        } else {
            uint256 absDelta = uint256(-delta);
            if (absDelta >= oldScore) {
                agents[agentId].reputationScore = 0;
            } else {
                agents[agentId].reputationScore -= absDelta;
            }
        }

        emit ReputationUpdated(agentId, agents[agentId].reputationScore, delta);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}
}
