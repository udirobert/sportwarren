import { ethers } from "hardhat";
import "@openzeppelin/hardhat-upgrades";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const isMainnet = chainId === 2345;
  const networkLabel = isMainnet ? "GOAT Network Mainnet" : "GOAT Testnet3";

  console.log(`\nDeploying to ${networkLabel} (chain ${chainId})`);
  console.log("Deployer:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "BTC\n");

  // 1. Deploy Squad Token (ERC20 Votes Proxy)
  console.log("Deploying SquadToken...");
  const SquadToken = await ethers.getContractFactory("SquadToken");
  const squadToken = await upgrades.deployProxy(SquadToken, [deployer.address], { kind: "uups" });
  await squadToken.waitForDeployment();
  const tokenAddress = await squadToken.getAddress();
  console.log("SquadToken deployed to:", tokenAddress);

  // 2. Deploy Squad Timelock
  console.log("Deploying SquadTimelock...");
  const SquadTimelock = await ethers.getContractFactory("SquadTimelock");
  const minDelay = 172800; // 48 hours
  const proposers = [deployer.address];
  const executors = [ethers.ZeroAddress];
  const timelock = await upgrades.deployProxy(SquadTimelock, [minDelay, proposers, executors, deployer.address], { kind: "uups" });
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("SquadTimelock deployed to:", timelockAddress);

  // 3. Deploy Squad Governor
  console.log("Deploying SquadGovernor...");
  const SquadGovernor = await ethers.getContractFactory("SquadGovernor");
  const squadGovernor = await upgrades.deployProxy(SquadGovernor, [tokenAddress, timelockAddress, deployer.address], { kind: "uups" });
  await squadGovernor.waitForDeployment();
  const governorAddress = await squadGovernor.getAddress();
  console.log("SquadGovernor deployed to:", governorAddress);

  // 4. Deploy Achievement NFT
  console.log("Deploying AchievementNFT...");
  const AchievementNFT = await ethers.getContractFactory("AchievementNFT");
  const achievementNFT = await upgrades.deployProxy(AchievementNFT, [deployer.address], { kind: "uups" });
  await achievementNFT.waitForDeployment();
  const nftAddress = await achievementNFT.getAddress();
  console.log("AchievementNFT deployed to:", nftAddress);

  // 5. Deploy Agent Escrow
  console.log("Deploying AgentEscrow...");
  const AgentEscrow = await ethers.getContractFactory("AgentEscrow");
  const agentEscrow = await upgrades.deployProxy(AgentEscrow, [tokenAddress, deployer.address], { kind: "uups" });
  await agentEscrow.waitForDeployment();
  const escrowAddress = await agentEscrow.getAddress();
  console.log("AgentEscrow deployed to:", escrowAddress);

  // 6. Deploy GoatReputation (custom ERC-8004 wrapper)
  console.log("Deploying GoatReputation...");
  const GoatReputation = await ethers.getContractFactory("GoatReputation");
  const goatReputation = await upgrades.deployProxy(GoatReputation, [deployer.address], { kind: "uups" });
  await goatReputation.waitForDeployment();
  const reputationAddress = await goatReputation.getAddress();
  console.log("GoatReputation deployed to:", reputationAddress);

  const explorerBase = isMainnet
    ? "https://explorer.goat.network"
    : "https://explorer.testnet3.goat.network";

  const deployment = {
    network: networkLabel,
    chainId,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    explorer: explorerBase,
    contracts: {
      SquadToken: tokenAddress,
      SquadTimelock: timelockAddress,
      SquadGovernor: governorAddress,
      AchievementNFT: nftAddress,
      AgentEscrow: escrowAddress,
      GoatReputation: reputationAddress,
    },
    erc8004: {
      note: "Use canonical GOAT Network IdentityRegistry for agent registration",
      identityRegistry: isMainnet
        ? "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
        : "0x556089008Fc0a60cD09390Eca93477ca254A5522",
      reputationRegistry: isMainnet
        ? "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63"
        : "0xd9140951d8aE6E5F625a02F5908535e16e3af964",
    },
  };

  const outPath = path.join(__dirname, `../../deployment-goat-${isMainnet ? "mainnet" : "testnet"}.json`);
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log(`\nDeployment saved to: ${outPath}`);

  console.log(`
  ===========================================
  ${networkLabel} Deployment Complete
  ===========================================
  SquadToken:      ${tokenAddress}
  SquadTimelock:   ${timelockAddress}
  SquadGovernor:   ${governorAddress}
  AchievementNFT:  ${nftAddress}
  AgentEscrow:     ${escrowAddress}
  GoatReputation:  ${reputationAddress}
  
  Explorer: ${explorerBase}
  
  Next steps:
  1. Register agents in canonical ERC-8004 IdentityRegistry
  2. Configure GOAT_* env vars with these addresses
  3. Test x402 payments on GOAT Network
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
