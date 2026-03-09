import { ethers } from "hardhat";
import "@openzeppelin/hardhat-upgrades";

/**
 * Initialize Governance Structure
 * 
 * This script sets up the proper roles between:
 * - SquadToken (governance token)
 * - SquadGovernor (governance logic)
 * - SquadTimelock (timelock controller)
 * 
 * Role transfers:
 * 1. Transfer TIMELOCK_ADMIN_ROLE from deployer to Governor
 * 2. Grant PROPOSER_ROLE to Governor (so it can propose to timelock)
 * 3. Grant EXECUTOR_ROLE to Timelock (so anyone can execute after delay)
 * 4. Renounce DEFAULT_ADMIN_ROLE from deployer (optional, for decentralization)
 */

async function main() {
  console.log("\n==============================================");
  console.log("🏛️  Initializing Governance Structure");
  console.log("==============================================\n");

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer Address: ${deployer.address}\n`);

  // Contract addresses (update these if needed)
  const SQUAD_TOKEN_ADDRESS = process.env.AVALANCHE_SQUAD_TOKEN_ADDRESS || "0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB";
  const SQUAD_TIMELOCK_ADDRESS = process.env.AVALANCHE_TIMELOCK_ADDRESS || "0xb3cF66142882b3eAf197167cA7191654d4Ea5A78";
  const SQUAD_GOVERNOR_ADDRESS = process.env.AVALANCHE_GOVERNOR_ADDRESS || "0x2e98aF1871bF208Ad361202884AB88F904eFf826";

  console.log("Using Contracts:");
  console.log(`  SquadToken:    ${SQUAD_TOKEN_ADDRESS}`);
  console.log(`  SquadTimelock: ${SQUAD_TIMELOCK_ADDRESS}`);
  console.log(`  SquadGovernor: ${SQUAD_GOVERNOR_ADDRESS}\n`);

  // Get contract instances
  const SquadToken = await ethers.getContractFactory("SquadToken");
  const squadToken = SquadToken.attach(SQUAD_TOKEN_ADDRESS);

  const SquadTimelock = await ethers.getContractFactory("SquadTimelock");
  const squadTimelock = SquadTimelock.attach(SQUAD_TIMELOCK_ADDRESS);

  const SquadGovernor = await ethers.getContractFactory("SquadGovernor");
  const squadGovernor = SquadGovernor.attach(SQUAD_GOVERNOR_ADDRESS);

  // Role constants (from OpenZeppelin TimelockController)
  const TIMELOCK_ADMIN_ROLE = ethers.id("TIMELOCK_ADMIN_ROLE");
  const PROPOSER_ROLE = ethers.id("PROPOSER_ROLE");
  const EXECUTOR_ROLE = ethers.id("EXECUTOR_ROLE");
  const CANCELLER_ROLE = ethers.id("CANCELLER_ROLE");

  console.log("Role Identifiers:");
  console.log(`  TIMELOCK_ADMIN_ROLE: ${TIMELOCK_ADMIN_ROLE}`);
  console.log(`  PROPOSER_ROLE:       ${PROPOSER_ROLE}`);
  console.log(`  EXECUTOR_ROLE:       ${EXECUTOR_ROLE}`);
  console.log(`  CANCELLER_ROLE:      ${CANCELLER_ROLE}\n`);

  // Check current roles
  console.log("📋 Current Role Holders:");
  
  const deployerHasAdminRole = await squadTimelock.hasRole(TIMELOCK_ADMIN_ROLE, deployer.address);
  const governorHasAdminRole = await squadTimelock.hasRole(TIMELOCK_ADMIN_ROLE, SQUAD_GOVERNOR_ADDRESS);
  const governorHasProposerRole = await squadTimelock.hasRole(PROPOSER_ROLE, SQUAD_GOVERNOR_ADDRESS);
  const governorHasExecutorRole = await squadTimelock.hasRole(EXECUTOR_ROLE, SQUAD_GOVERNOR_ADDRESS);
  
  console.log(`  Deployer has TIMELOCK_ADMIN_ROLE: ${deployerHasAdminRole ? "✅ YES" : "❌ NO"}`);
  console.log(`  Governor has TIMELOCK_ADMIN_ROLE: ${governorHasAdminRole ? "✅ YES" : "❌ NO"}`);
  console.log(`  Governor has PROPOSER_ROLE:       ${governorHasProposerRole ? "✅ YES" : "❌ NO"}`);
  console.log(`  Governor has EXECUTOR_ROLE:       ${governorHasExecutorRole ? "✅ YES" : "❌ NO"}\n`);

  // Step 1: Grant PROPOSER_ROLE to Governor
  if (!governorHasProposerRole) {
    console.log("📝 Step 1: Granting PROPOSER_ROLE to Governor...");
    const tx1 = await squadTimelock.grantRole(PROPOSER_ROLE, SQUAD_GOVERNOR_ADDRESS);
    console.log(`  Transaction: ${tx1.hash}`);
    await tx1.wait();
    console.log("  ✅ PROPOSER_ROLE granted\n");
  } else {
    console.log("⏭️  Step 1: PROPOSER_ROLE already granted to Governor\n");
  }

  // Step 2: Grant EXECUTOR_ROLE to Timelock (zero address means anyone can execute)
  // Actually, we want to grant it to zero address so anyone can execute
  const executorRoleCheck = await squadTimelock.hasRole(EXECUTOR_ROLE, ethers.ZeroAddress);
  if (!executorRoleCheck) {
    console.log("📝 Step 2: Granting EXECUTOR_ROLE to anyone (ZeroAddress)...");
    const tx2 = await squadTimelock.grantRole(EXECUTOR_ROLE, ethers.ZeroAddress);
    console.log(`  Transaction: ${tx2.hash}`);
    await tx2.wait();
    console.log("  ✅ EXECUTOR_ROLE granted to anyone\n");
  } else {
    console.log("⏭️  Step 2: EXECUTOR_ROLE already granted to anyone\n");
  }

  // Step 3: Grant CANCELLER_ROLE to Governor
  const governorHasCancellerRole = await squadTimelock.hasRole(CANCELLER_ROLE, SQUAD_GOVERNOR_ADDRESS);
  if (!governorHasCancellerRole) {
    console.log("📝 Step 3: Granting CANCELLER_ROLE to Governor...");
    const tx3 = await squadTimelock.grantRole(CANCELLER_ROLE, SQUAD_GOVERNOR_ADDRESS);
    console.log(`  Transaction: ${tx3.hash}`);
    await tx3.wait();
    console.log("  ✅ CANCELLER_ROLE granted\n");
  } else {
    console.log("⏭️  Step 3: CANCELLER_ROLE already granted to Governor\n");
  }

  // Step 4: Transfer TIMELOCK_ADMIN_ROLE to Governor
  if (!governorHasAdminRole) {
    console.log("📝 Step 4: Granting TIMELOCK_ADMIN_ROLE to Governor...");
    
    const tx4a = await squadTimelock.grantRole(TIMELOCK_ADMIN_ROLE, SQUAD_GOVERNOR_ADDRESS);
    console.log(`  Grant Transaction: ${tx4a.hash}`);
    await tx4a.wait();
    console.log("  ✅ TIMELOCK_ADMIN_ROLE granted to Governor\n");
  } else {
    console.log("⏭️  Step 4: TIMELOCK_ADMIN_ROLE already held by Governor\n");
  }

  // Optional: Renounce admin role from deployer if they still have it
  const deployerStillHasRole = await squadTimelock.hasRole(TIMELOCK_ADMIN_ROLE, deployer.address);
  if (deployerStillHasRole) {
    console.log("📝 Step 5: Revoking TIMELOCK_ADMIN_ROLE from deployer...");
    const tx4b = await squadTimelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);
    console.log(`  Revoke Transaction: ${tx4b.hash}`);
    await tx4b.wait();
    console.log("  ✅ TIMELOCK_ADMIN_ROLE revoked from deployer\n");
  } else {
    console.log("⏭️  Step 5: Deployer already doesn't have admin role\n");
  }

  // Final verification
  console.log("\n==============================================");
  console.log("✅ Final Verification");
  console.log("==============================================\n");

  const finalAdminRole = await squadTimelock.hasRole(TIMELOCK_ADMIN_ROLE, SQUAD_GOVERNOR_ADDRESS);
  const finalProposerRole = await squadTimelock.hasRole(PROPOSER_ROLE, SQUAD_GOVERNOR_ADDRESS);
  const finalExecutorRole = await squadTimelock.hasRole(EXECUTOR_ROLE, ethers.ZeroAddress);
  const finalCancellerRole = await squadTimelock.hasRole(CANCELLER_ROLE, SQUAD_GOVERNOR_ADDRESS);
  const deployerFinalRole = await squadTimelock.hasRole(TIMELOCK_ADMIN_ROLE, deployer.address);

  console.log("Governance Structure:");
  console.log(`  ✅ Governor has TIMELOCK_ADMIN_ROLE: ${finalAdminRole ? "YES ✓" : "NO ✗"}`);
  console.log(`  ✅ Governor has PROPOSER_ROLE:       ${finalProposerRole ? "YES ✓" : "NO ✗"}`);
  console.log(`  ✅ Anyone has EXECUTOR_ROLE:         ${finalExecutorRole ? "YES ✓" : "NO ✗"}`);
  console.log(`  ✅ Governor has CANCELLER_ROLE:      ${finalCancellerRole ? "YES ✓" : "NO ✗"}`);
  console.log(`  ✅ Deployer admin revoked:           ${!deployerFinalRole ? "YES ✓" : "NO (kept for testing)"}`);

  // Display governance flow
  console.log("\n==============================================");
  console.log("📚 How Governance Works");
  console.log("==============================================\n");
  console.log("1. Token holders vote on proposals via SquadGovernor");
  console.log("2. If proposal passes → Governor queues to Timelock");
  console.log("3. Timelock waits 48 hours (delay period)");
  console.log("4. Anyone can execute the proposal after delay");
  console.log("5. Governor can cancel proposals if needed\n");

  console.log("Explorer Links:");
  console.log(`  Timelock:  https://testnet.snowtrace.io/address/${SQUAD_TIMELOCK_ADDRESS}`);
  console.log(`  Governor:  https://testnet.snowtrace.io/address/${SQUAD_GOVERNOR_ADDRESS}`);
  console.log(`  Token:     https://testnet.snowtrace.io/address/${SQUAD_TOKEN_ADDRESS}\n`);

  console.log("🎉 Governance initialization complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error initializing governance:", error);
    process.exit(1);
  });
