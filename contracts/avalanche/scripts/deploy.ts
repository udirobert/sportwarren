import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. Deploy Squad Token (ERC20 Votes)
    const squadTokenFactory = await ethers.getContractFactory("SquadToken");
    const squadToken = await squadTokenFactory.deploy(deployer.address);
    await squadToken.waitForDeployment();
    const tokenAddress = await squadToken.getAddress();
    console.log("SquadToken deployed to:", tokenAddress);

    // 2. Deploy Squad Governor
    const squadGovernorFactory = await ethers.getContractFactory("SquadGovernor");
    const squadGovernor = await squadGovernorFactory.deploy(tokenAddress);
    await squadGovernor.waitForDeployment();
    const governorAddress = await squadGovernor.getAddress();
    console.log("SquadGovernor deployed to:", governorAddress);

    // 3. Deploy Achievement NFT
    const achievementNFTFactory = await ethers.getContractFactory("AchievementNFT");
    const achievementNFT = await achievementNFTFactory.deploy(deployer.address);
    await achievementNFT.waitForDeployment();
    const nftAddress = await achievementNFT.getAddress();
    console.log("AchievementNFT deployed to:", nftAddress);

    // 4. Deploy Agent Escrow
    // Note: Replace the first argument with a real stablecoin or token address on Fuji Testnet for Agent Escrow
    // For now, using SquadToken as the accepted token for escrow
    const agentEscrowFactory = await ethers.getContractFactory("AgentEscrow");
    const agentEscrow = await agentEscrowFactory.deploy(tokenAddress, deployer.address);
    await agentEscrow.waitForDeployment();
    const escrowAddress = await agentEscrow.getAddress();
    console.log("AgentEscrow deployed to:", escrowAddress);

    console.log(`
  =============================
  Avalanche Deployment Complete
  =============================
  SquadToken: ${tokenAddress}
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
