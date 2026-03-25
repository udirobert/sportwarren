#!/usr/bin/env tsx

/**
 * Find all deployed contracts on Algorand and Avalanche
 * using the deployer credentials from .env
 */

import algosdk from "algosdk";
import * as dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

// ─────────────────────────────────────────────────────────────
// Algorand
// ─────────────────────────────────────────────────────────────
async function findAlgorandContracts() {
  console.log("\n===========================================");
  console.log("🔍 ALGORAND TESTNET - Finding Deployed Contracts");
  console.log("===========================================\n");

  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) {
    console.error("❌ DEPLOYER_MNEMONIC not found in .env");
    return;
  }

  try {
    // Connect to Algorand testnet
    const algodClient = new algosdk.Algodv2(
      "",
      "https://testnet-api.algonode.cloud",
      443
    );
    const _indexerClient = new algosdk.Indexer(
      "",
      "https://testnet-idx.algonode.cloud",
      443
    );

    // Get account from mnemonic
    const account = algosdk.mnemonicToSecretKey(mnemonic);
    const address = account.addr.toString();

    console.log(`📍 Deployer Address: ${address}\n`);

    // Get account info
    const accountInfo = await algodClient.accountInformation(address).do();
    const balance = Number(accountInfo.amount);
    console.log(`💰 Balance: ${balance > 0 ? algosdk.microalgosToAlgos(balance) : 0} ALGO`);
    console.log(`📊 Total Apps Created: ${accountInfo["created-apps"]?.length || 0}`);
    console.log(`📋 Total Assets Created: ${accountInfo["created-assets"]?.length || 0}\n`);

    // List all created apps (smart contracts)
    if (accountInfo["created-apps"] && accountInfo["created-apps"].length > 0) {
      console.log("🏗️  DEPLOYED APPLICATIONS (Smart Contracts):\n");
      console.log("┌───────┬──────────────────────────────────────┬─────────────┬──────────────┐");
      console.log("│ App ID│ Name                                 │ Global State│ Local State  │");
      console.log("├───────┼──────────────────────────────────────┼─────────────┼──────────────┤");

      for (const app of accountInfo["created-apps"]) {
        const appId = app.id;
        const globalState = app.params["global-state"]?.length || 0;
        const localState = app.params["local-state-schema"]?.["num-byte-slice"] + 
                          (app.params["local-state-schema"]?.["num-uint"] || 0);
        
        // Try to get app name from global state
        let appName = "Unknown";
        const nameEntry = app.params["global-state"]?.find((entry: any) => {
          const key = Buffer.from(entry.key, "base64").toString("utf8");
          return key === "name" || key === "contract_name";
        });
        if (nameEntry) {
          appName = Buffer.from(nameEntry.value.bytes, "base64").toString("utf8");
        }

        console.log(`│ ${String(appId).padEnd(6)}│ ${appName.padEnd(37)}│ ${String(globalState).padEnd(12)}│ ${String(localState).padEnd(13)}│`);
      }
      console.log("└───────┴──────────────────────────────────────┴─────────────┴──────────────┘\n");

      // Generate explorer links
      console.log("🔗 EXPLORER LINKS:");
      for (const app of accountInfo["created-apps"]) {
        const appId = app.id;
        console.log(`   • App ${appId}:`);
        console.log(`     https://testnet.algoscan.app/app/${appId}`);
        console.log(`     https://testnet.explorer.perawallet.app/app/${appId}`);
        console.log(`     https://testnet. AlgoExplorer.com/application/${appId}\n`);
      }
    } else {
      console.log("⚠️  No applications found deployed by this address\n");
    }

    // List all created assets (tokens/NFTs)
    if (accountInfo["created-assets"] && accountInfo["created-assets"].length > 0) {
      console.log("\n🪙  DEPLOYED ASSETS (Tokens/NFTs):\n");
      for (const asset of accountInfo["created-assets"]) {
        console.log(`   • Asset ID: ${asset.index}`);
        console.log(`     Name: ${asset.params.name}`);
        console.log(`     Unit: ${asset.params["unit-name"]}`);
        console.log(`     Total: ${asset.params.total}`);
        console.log(`     Explorer: https://testnet.algoscan.app/asset/${asset.index}\n`);
      }
    }

    // Check if known App ID exists
    const knownAppId = process.env.ALGORAND_MATCH_VERIFICATION_APP_ID;
    if (knownAppId) {
      console.log("\n✅ VERIFICATION OF KNOWN CONTRACT:");
      console.log(`   Match Verification App ID: ${knownAppId}`);
      try {
        const appInfo = await algodClient.getApplicationByID(parseInt(knownAppId)).do();
        console.log(`   Status: ✅ EXISTS`);
        console.log(`   Creator: ${appInfo.params.creator}`);
        console.log(`   Matches Deployer: ${appInfo.params.creator === address ? "YES ✓" : "NO ✗"}`);
      } catch (error: any) {
        console.log(`   Status: ❌ NOT FOUND - ${error.message}`);
      }
    }

  } catch (error: any) {
    console.error("❌ Error querying Algorand:", error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Avalanche
// ─────────────────────────────────────────────────────────────
async function findAvalancheContracts() {
  console.log("\n===========================================");
  console.log("🔍 AVALANCHE FUJI TESTNET - Finding Deployed Contracts");
  console.log("===========================================\n");

  const privateKey = process.env.AVALANCHE_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";

  if (!privateKey) {
    console.log("⚠️  AVALANCHE_PRIVATE_KEY or PRIVATE_KEY not found in .env");
    console.log("   Please add your Fuji testnet private key to .env:\n");
    console.log("   AVALANCHE_PRIVATE_KEY=your_private_key_here\n");
    return;
  }

  try {
    // Connect to Avalanche Fuji
    const provider = new ethers.JsonRpcProvider(rpcUrl, 43113);
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = await wallet.getAddress();

    console.log(`📍 Deployer Address: ${address}`);
    
    // Get balance
    const balance = await provider.getBalance(address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX\n`);

    // Get transaction count (nonce)
    const txCount = await provider.getTransactionCount(address);
    console.log(`📊 Transaction Count: ${txCount}\n`);

    // Note: EVM doesn't have a direct "list all contracts created" API
    // We need to check transaction history or use indexer APIs
    console.log("ℹ️  To find deployed contracts on Avalanche:");
    console.log("   1. Check deployment script output");
    console.log("   2. Look at transaction history on snowtrace.io");
    console.log("   3. Use the contract factory to verify deployments\n");

    console.log("🔗 EXPLORER LINKS:");
    console.log(`   • Address: https://testnet.snowtrace.io/address/${address}`);
    console.log(`   • Transactions: https://testnet.snowtrace.io/txs?a=${address}\n`);

    // If you have expected contract addresses, verify them here
    const expectedContracts = [
      { name: "SquadToken", env: "AVALANCHE_SQUAD_TOKEN_ADDRESS" },
      { name: "SquadGovernor", env: "AVALANCHE_GOVERNOR_ADDRESS" },
      { name: "SquadTimelock", env: "AVALANCHE_TIMELOCK_ADDRESS" },
      { name: "AchievementNFT", env: "AVALANCHE_ACHIEVEMENT_NFT_ADDRESS" },
      { name: "AgentEscrow", env: "AVALANCHE_AGENT_ESCROW_ADDRESS" },
    ];

    console.log("📋 CHECKING EXPECTED CONTRACTS:");
    for (const contract of expectedContracts) {
      const address = process.env[contract.env];
      if (address) {
        try {
          const code = await provider.getCode(address);
          const isContract = code !== "0x";
          console.log(`   ${contract.name}: ${isContract ? "✅ Contract exists" : "❌ No contract"} (${address})`);
        } catch (error: any) {
          console.log(`   ${contract.name}: ❌ Error - ${error.message}`);
        }
      } else {
        console.log(`   ${contract.name}: ⚠️  Address not set in .env (${contract.env})`);
      }
    }

  } catch (error: any) {
    console.error("❌ Error querying Avalanche:", error.message);
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║   SportWarren Contract Discovery Tool         ║");
  console.log("╚═══════════════════════════════════════════════╝");

  await findAlgorandContracts();
  await findAvalancheContracts();

  console.log("\n✅ Done!\n");
}

main().catch(console.error);
