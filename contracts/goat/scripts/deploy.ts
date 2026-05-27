import { ethers } from "hardhat";
import "@openzeppelin/hardhat-upgrades";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying proxies with the account:", deployer.address);

  // 1. Deploy Squad Token (ERC20 Votes Proxy)
  console.log("Deploying SquadToken...");
  const SquadToken = await ethers.getContractFactory("SquadToken");
  const squadToken = await upgrades.deployProxy(SquadToken, [deployer.address], { kind: "uups" });
  await squadToken.waitForDeployment();
  const tokenAddress = await squadToken.getAddress();
  console.log("SquadToken deployed to:", tokenAddress);

  // 2. Deploy Squad Timelock (needed for Governor)
  console.log("Deploying SquadTimelock...");
  const SquadTimelock = await ethers.getContractFactory("SquadTimelock");
  const minDelay = 172800; // 48 hours in seconds
  const proposers = [deployer.address]; // At first, deployer can propose to timelock. Usually this is the Governor.
  const executors = [ethers.ZeroAddress]; // Anyone can execute once delay has passed
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

  // Note: Here you would normally transfer the TIMELOCK_ADMIN_ROLE to the Governor and revoke it from the deployer.

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

  console.log(`
  ===========================================
  Avalanche UUPS Upgradeable Deployments Done
  ===========================================
  SquadToken: ${tokenAddress}
  SquadTimelock: ${timelockAddress}
  SquadGovernor: ${governorAddress}
  AchievementNFT: ${nftAddress}
  AgentEscrow: ${escrowAddress}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
