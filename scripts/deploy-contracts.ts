#!/usr/bin/env tsx

import algosdk from "algosdk";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Environment configuration
interface Config {
  algodToken: string;
  algodServer: string;
  algodPort: number;
  indexerToken: string;
  indexerServer: string;
  indexerPort: number;
  deployerMnemonic: string;
  network: "local" | "testnet" | "mainnet";
}

// Contract configuration
interface ContractConfig {
  name: string;
  approvalPath: string;
  clearStatePath: string;
  globalInts: number;
  globalBytes: number;
  localInts: number;
  localBytes: number;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const getConfig = (): Config => {
  const network = process.env.ALGORAND_NETWORK || "testnet";

  switch (network) {
    case "local":
      return {
        algodToken:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        algodServer: "http://localhost",
        algodPort: 4001,
        indexerToken:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        indexerServer: "http://localhost",
        indexerPort: 8980,
        deployerMnemonic: process.env.DEPLOYER_MNEMONIC || "",
        network: "local",
      };
    case "testnet":
      return {
        algodToken: "",
        algodServer: "https://testnet-api.algonode.cloud",
        algodPort: 443,
        indexerToken: "",
        indexerServer: "https://testnet-idx.algonode.cloud",
        indexerPort: 443,
        deployerMnemonic: process.env.DEPLOYER_MNEMONIC || "",
        network: "testnet",
      };
    case "mainnet":
      return {
        algodToken: "",
        algodServer: "https://mainnet-api.algonode.cloud",
        algodPort: 443,
        indexerToken: "",
        indexerServer: "https://mainnet-idx.algonode.cloud",
        indexerPort: 443,
        deployerMnemonic: process.env.DEPLOYER_MNEMONIC || "",
        network: "mainnet",
      };
    default:
      throw new Error(`Unknown network: ${network}`);
  }
};

// Contract definitions
const CONTRACTS: ContractConfig[] = [
  {
    name: "MatchVerification",
    approvalPath: "contracts/match_verification/approval.teal",
    clearStatePath: "contracts/match_verification/clear_state.teal",
    globalInts: 8,
    globalBytes: 8,
    localInts: 3,
    localBytes: 3,
  },
];

class ContractDeployer {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private deployerAccount: algosdk.Account;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
    this.algodClient = new algosdk.Algodv2(
      config.algodToken,
      config.algodServer,
      config.algodPort,
    );
    this.indexerClient = new algosdk.Indexer(
      config.indexerToken,
      config.indexerServer,
      config.indexerPort,
    );

    if (!config.deployerMnemonic) {
      throw new Error("DEPLOYER_MNEMONIC environment variable is required");
    }

    this.deployerAccount = algosdk.mnemonicToSecretKey(config.deployerMnemonic);
  }

  private async waitForTransaction(txId: string) {
    const status = await this.algodClient.status().do();
    let lastRound = status.lastRound;

    while (true) {
      const pendingInfo = await this.algodClient
        .pendingTransactionInformation(txId)
        .do();
      if (
        pendingInfo.confirmedRound != null &&
        pendingInfo.confirmedRound > 0
      ) {
        return pendingInfo;
      }
      lastRound++;
      await this.algodClient.statusAfterBlock(lastRound).do();
    }
  }

  private readTealFile(filePath: string): Uint8Array {
    const fullPath = path.join(__dirname, "..", filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`TEAL file not found: ${fullPath}`);
    }
    return fs.readFileSync(fullPath);
  }

  private async compileTeal(source: Uint8Array): Promise<Uint8Array> {
    const compileResponse = await this.algodClient.compile(source).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  }

  async deployContract(contractConfig: ContractConfig): Promise<number> {
    console.log(`\n🚀 Deploying ${contractConfig.name}...`);

    try {
      // Read and compile TEAL files
      const approvalSource = this.readTealFile(contractConfig.approvalPath);
      const clearStateSource = this.readTealFile(contractConfig.clearStatePath);

      console.log(`📖 Reading TEAL files...`);
      const approvalProgram = await this.compileTeal(approvalSource);
      const clearStateProgram = await this.compileTeal(clearStateSource);

      // Create application
      const params = await this.algodClient.getTransactionParams().do();
      params.fee = 10000;
      params.flatFee = true;

      const createTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: this.deployerAccount.addr,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: approvalProgram,
        clearProgram: clearStateProgram,
        numLocalInts: contractConfig.localInts,
        numLocalByteSlices: contractConfig.localBytes,
        numGlobalInts: contractConfig.globalInts,
        numGlobalByteSlices: contractConfig.globalBytes,
      });

      console.log(`📝 Creating application transaction...`);
      const signedTxn = createTxn.signTxn(this.deployerAccount.sk);
      const txResponse = await this.algodClient
        .sendRawTransaction(signedTxn)
        .do();
      const txId = txResponse.txid;

      console.log(`⏳ Waiting for transaction confirmation...`);
      const confirmedTxn = await this.waitForTransaction(txId);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const appId = (confirmedTxn as any)["application-index"] || (confirmedTxn as any).applicationIndex;
      if (!appId) {
        throw new Error(`Application ID not found in confirmed transaction. Transaction might have failed on-chain or response format changed.`);
      }
      const appAddress = algosdk.getApplicationAddress(appId);

      console.log(`✅ ${contractConfig.name} deployed successfully!`);
      console.log(`   📋 Application ID: ${appId}`);
      console.log(`   📍 Application Address: ${appAddress}`);
      console.log(`   🔗 Transaction ID: ${txId}`);

      return appId;
    } catch (error) {
      console.error(`❌ Failed to deploy ${contractConfig.name}:`, error);
      throw error;
    }
  }

  async deployAllContracts(): Promise<Record<string, number>> {
    console.log(`🌟 Starting deployment to ${this.config.network} network...`);
    console.log(`👤 Deployer address: ${this.deployerAccount.addr}`);

    // Check deployer balance
    const accountInfo = await this.algodClient
      .accountInformation(this.deployerAccount.addr)
      .do();
    const balance = Number(accountInfo.amount) / 1000000; // Convert microALGOs to ALGOs
    console.log(`💰 Deployer balance: ${balance} ALGOs`);

    if (balance < 1) {
      throw new Error(
        "Insufficient ALGO balance for deployment. Minimum 1 ALGO required.",
      );
    }

    const deployedContracts: Record<string, number> = {};

    for (const contract of CONTRACTS) {
      try {
        const appId = await this.deployContract(contract);
        deployedContracts[contract.name] = appId;
      } catch (deployError) {
        console.error(
          `Failed to deploy ${contract.name}, continuing with other contracts...`,
          deployError,
        );
      }
    }

    console.log(`\n🎉 Deployment Summary:`);
    console.log(`Network: ${this.config.network}`);
    Object.entries(deployedContracts).forEach(([name, appId]) => {
      console.log(`  ${name}: ${appId}`);
    });

    // Save deployment info to file
    const deploymentInfo = {
      network: this.config.network,
      timestamp: new Date().toISOString(),
      deployer: this.deployerAccount.addr,
      contracts: deployedContracts,
    };

    const outputPath = path.join(
      __dirname,
      "..",
      `deployment-${this.config.network}.json`,
    );
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${outputPath}`);

    return deployedContracts;
  }
}

// Main execution
async function main() {
  try {
    const config = getConfig();
    const deployer = new ContractDeployer(config);
    await deployer.deployAllContracts();
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ContractDeployer, getConfig, CONTRACTS };
