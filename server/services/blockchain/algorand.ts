import algosdk from "algosdk";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

export class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private squadDAOAppId: number | null = null;
  private matchVerificationAppId: number | null = null;

  constructor() {
    const algodServer = process.env.ALGORAND_NODE_URL;
    const indexerServer = process.env.ALGORAND_INDEXER_URL;

    if (!algodServer || !indexerServer) {
      throw new Error(
        "ALGORAND_NODE_URL and ALGORAND_INDEXER_URL must be set in .env",
      );
    }

    const algodToken = process.env.ALGORAND_NODE_TOKEN || "";
    const indexerToken = process.env.ALGORAND_INDEXER_TOKEN || "";

    this.algodClient = new algosdk.Algodv2(algodToken, algodServer);
    this.indexerClient = new algosdk.Indexer(indexerToken, indexerServer);
  }

  public async deploySquadDAO(): Promise<number | null> {
    try {
      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY; // This should be a deployer account
      if (!creatorMnemonic) {
        throw new Error("ALGORAND_PRIVATE_KEY not set in .env");
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      // Read TEAL code
      const approvalProgramPath = path.resolve(
        __dirname,
        "../../../squad_dao_approval.teal",
      );
      const clearProgramPath = path.resolve(
        __dirname,
        "../../../squad_dao_clear_state.teal",
      );

      const approvalProgram = fs.readFileSync(approvalProgramPath, "utf8");
      const clearProgram = fs.readFileSync(clearProgramPath, "utf8");

      const compiledApproval = await this.algodClient
        .compile(approvalProgram)
        .do();
      const compiledClear = await this.algodClient.compile(clearProgram).do();

      const approvalProgramBytes = new Uint8Array(
        Buffer.from(compiledApproval.result, "base64"),
      );
      const clearProgramBytes = new Uint8Array(
        Buffer.from(compiledClear.result, "base64"),
      );

      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const numGlobalInts = 3; // DAO_CREATOR, GOVERNANCE_TOKEN_ID, PROPOSAL_COUNTER
      const numGlobalBytes = 0;
      const numLocalInts = 1; // USER_TOKEN_BALANCE
      const numLocalBytes = 0;

      const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: creatorAccount.addr,
        suggestedParams: suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: approvalProgramBytes,
        clearProgram: clearProgramBytes,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
      });

      const signedTxn = appCreateTxn.signTxn(creatorAccount.sk);
      const txId = appCreateTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      const confirmedTxn = await algosdk.waitForConfirmation(
        this.algodClient,
        txId,
        4,
      );

      const appId = Number(confirmedTxn.applicationIndex);
      this.squadDAOAppId = appId;
      console.log(`Squad DAO Application deployed with ID: ${appId}`);
      return appId;
    } catch (error) {
      console.error("Error deploying Squad DAO:", error);
      return null;
    }
  }

  public getSquadDAOAppId(): number | null {
    return this.squadDAOAppId;
  }

  public async deployMatchVerification(): Promise<number | null> {
    try {
      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error("ALGORAND_PRIVATE_KEY not set in .env");
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      // Read TEAL code
      const approvalProgramPath = path.resolve(
        __dirname,
        "../../../match_verification_approval.teal",
      );
      const clearProgramPath = path.resolve(
        __dirname,
        "../../../match_verification_clear_state.teal",
      );

      const approvalProgram = fs.readFileSync(approvalProgramPath, "utf8");
      const clearProgram = fs.readFileSync(clearProgramPath, "utf8");

      const compiledApproval = await this.algodClient
        .compile(approvalProgram)
        .do();
      const compiledClear = await this.algodClient.compile(clearProgram).do();

      const approvalProgramBytes = new Uint8Array(
        Buffer.from(compiledApproval.result, "base64"),
      );
      const clearProgramBytes = new Uint8Array(
        Buffer.from(compiledClear.result, "base64"),
      );

      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const numGlobalInts = 4; // ORACLE_CREATOR, MATCH_COUNTER, MIN_VERIFICATIONS, REPUTATION_THRESHOLD
      const numGlobalBytes = 0;
      const numLocalInts = 2; // USER_REPUTATION, VERIFICATION_COUNT
      const numLocalBytes = 0;

      const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
        sender: creatorAccount.addr,
        suggestedParams: suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: approvalProgramBytes,
        clearProgram: clearProgramBytes,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
      });

      const signedTxn = appCreateTxn.signTxn(creatorAccount.sk);
      const txId = appCreateTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      const confirmedTxn = await algosdk.waitForConfirmation(
        this.algodClient,
        txId,
        4,
      );

      const appId = Number(confirmedTxn.applicationIndex);
      this.matchVerificationAppId = appId;
      console.log(`Match Verification Application deployed with ID: ${appId}`);
      return appId;
    } catch (error) {
      console.error("Error deploying Match Verification:", error);
      return null;
    }
  }

  public getMatchVerificationAppId(): number | null {
    return this.matchVerificationAppId;
  }

  public getWalletAddress(): string {
    const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
    if (creatorMnemonic) {
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
      return creatorAccount.addr.toString();
    }
    return "ALGORAND_WALLET_NOT_CONFIGURED";
  }

  public async getAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await this.algodClient
        .accountInformation(address)
        .do();
      return algosdk.microalgosToAlgos(Number(accountInfo.amount));
    } catch (error) {
      console.error(`Error fetching account balance for ${address}:`, error);
      return 0;
    }
  }

  public async getNetworkStatus(): Promise<any> {
    try {
      const status = await this.algodClient.status().do();
      return {
        network: "TestNet", // Assuming TestNet for now
        lastRound: Number(status.lastRound),
        timeSinceLastRound: Number(status.timeSinceLastRound),
        catchupTime: Number(status.catchupTime),
        health: "OK", // Health endpoint not available in current SDK
      };
    } catch (error) {
      console.error("Error fetching network status:", error);
      return {};
    }
  }

  public async optInToSquadDAO(userAddress: string): Promise<boolean> {
    if (!this.squadDAOAppId) {
      console.error("Squad DAO App ID not set. Deploy the DAO first.");
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
        sender: userAddress,
        suggestedParams: suggestedParams,
        appIndex: this.squadDAOAppId,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing opt-in transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = optInTxn.signTxn(creatorAccount.sk);
      const txId = optInTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `User ${userAddress} successfully opted into Squad DAO App ID: ${this.squadDAOAppId}`,
      );
      return true;
    } catch (error) {
      console.error(`Error opting in to Squad DAO for ${userAddress}:`, error);
      return false;
    }
  }

  public async createProposal(
    proposerAddress: string,
    description: string,
    startRound: number,
    endRound: number,
  ): Promise<boolean> {
    if (!this.squadDAOAppId) {
      console.error("Squad DAO App ID not set. Deploy the DAO first.");
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("create_proposal")),
        new Uint8Array(Buffer.from(description)),
        algosdk.encodeUint64(startRound),
        algosdk.encodeUint64(endRound),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: proposerAddress,
        suggestedParams: suggestedParams,
        appIndex: this.squadDAOAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing create proposal transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Proposal "${description}" created by ${proposerAddress} for Squad DAO App ID: ${this.squadDAOAppId}`,
      );
      return true;
    } catch (error) {
      console.error(`Error creating proposal for ${proposerAddress}:`, error);
      return false;
    }
  }

  public async voteOnProposal(
    voterAddress: string,
    proposalId: number,
    voteType: 0 | 1,
  ): Promise<boolean> {
    if (!this.squadDAOAppId) {
      console.error("Squad DAO App ID not set. Deploy the DAO first.");
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("vote")),
        algosdk.encodeUint64(proposalId),
        algosdk.encodeUint64(voteType),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: voterAddress,
        suggestedParams: suggestedParams,
        appIndex: this.squadDAOAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing vote transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Vote ${voteType} cast by ${voterAddress} on Proposal ID ${proposalId} for Squad DAO App ID: ${this.squadDAOAppId}`,
      );
      return true;
    } catch (error) {
      console.error(`Error voting on proposal for ${voterAddress}:`, error);
      return false;
    }
  }

  public async executeProposal(
    executorAddress: string,
    proposalId: number,
  ): Promise<boolean> {
    if (!this.squadDAOAppId) {
      console.error("Squad DAO App ID not set. Deploy the DAO first.");
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("execute_proposal")),
        algosdk.encodeUint64(proposalId),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: executorAddress,
        suggestedParams: suggestedParams,
        appIndex: this.squadDAOAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing execute proposal transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Proposal ID ${proposalId} executed by ${executorAddress} for Squad DAO App ID: ${this.squadDAOAppId}`,
      );
      return true;
    } catch (error) {
      console.error(`Error executing proposal for ${executorAddress}:`, error);
      return false;
    }
  }

  public async getProposals(): Promise<any[]> {
    if (!this.squadDAOAppId) {
      console.warn("Squad DAO App ID not set. Cannot fetch proposals.");
      return [];
    }

    try {
      const appInfo = await this.algodClient
        .getApplicationByID(this.squadDAOAppId)
        .do();
      const globalState = appInfo.params.globalState;

      const decodeBase64 = (value: Uint8Array) =>
        Buffer.from(value).toString("utf8");
      const decodeUint64 = (value: Uint8Array) =>
        Number(algosdk.decodeUint64(Buffer.from(value), "mixed"));

      const findGlobalStateValue = (key: string) => {
        const entry = globalState.find(
          (state: any) => decodeBase64(state.key) === key,
        );
        if (entry) {
          return entry.value.type === 1
            ? decodeBase64(entry.value.bytes)
            : decodeUint64(entry.value.bytes);
        }
        return null;
      };

      const proposalCounter = findGlobalStateValue("proposal_counter");
      if (proposalCounter === null || typeof proposalCounter !== 'number') return [];

      const proposals = [];
      for (let i = 1; i <= proposalCounter; i++) {
        const description = findGlobalStateValue(`prop_desc_${i}`);
        const startRound = findGlobalStateValue(`prop_start_${i}`);
        const endRound = findGlobalStateValue(`prop_end_${i}`);
        const votesFor = findGlobalStateValue(`prop_for_${i}`);
        const votesAgainst = findGlobalStateValue(`prop_against_${i}`);

        if (
          description !== null &&
          startRound !== null &&
          endRound !== null &&
          votesFor !== null &&
          votesAgainst !== null
        ) {
          proposals.push({
            id: i,
            description,
            startRound,
            endRound,
            votesFor,
            votesAgainst,
            totalVotes: (typeof votesFor === 'number' ? votesFor : 0) + (typeof votesAgainst === 'number' ? votesAgainst : 0),
            // You might need to fetch proposer from transaction history or add to global state
            proposer: "Unknown",
            status: "active", // Determine status based on current round and endRound
          });
        }
      }
      return proposals;
    } catch (error) {
      console.error("Error fetching proposals:", error);
      return [];
    }
  }

  public async getUserTokenBalance(address: string): Promise<number> {
    if (!this.squadDAOAppId) {
      console.warn(
        "Squad DAO App ID not set. Cannot fetch user token balance.",
      );
      return 0;
    }

    try {
      const accountInfo = await this.algodClient
        .accountInformation(address)
        .do();
      const appLocalState = accountInfo.appsLocalState.find(
        (app: any) => app.id === this.squadDAOAppId,
      );

      if (appLocalState && appLocalState.keyValue) {
        const userTokenBalanceEntry = appLocalState.keyValue.find(
          (state: any) => {
            const keyBuffer = typeof state.key === 'string' 
              ? Buffer.from(state.key, "base64") 
              : Buffer.from(state.key);
            return keyBuffer.toString("utf8") === "user_token_balance";
          }
        );
        if (userTokenBalanceEntry) {
          const valueBuffer = typeof userTokenBalanceEntry.value.bytes === 'string'
            ? Buffer.from(userTokenBalanceEntry.value.bytes, "base64")
            : Buffer.from(userTokenBalanceEntry.value.bytes);
          return Number(algosdk.decodeUint64(valueBuffer, "mixed"));
        }
      }
      return 0;
    } catch (error) {
      console.error(`Error fetching user token balance for ${address}:`, error);
      return 0;
    }
  }

  public async getSquadDAOInfo(): Promise<any> {
    if (!this.squadDAOAppId) {
      console.warn("Squad DAO App ID not set. Cannot fetch DAO info.");
      return null;
    }

    try {
      const appInfo = await this.algodClient
        .getApplicationByID(this.squadDAOAppId)
        .do();
      const globalState = appInfo.params.globalState;

      const decodeBase64 = (value: Uint8Array) =>
        Buffer.from(value).toString("utf8");
      const decodeUint64 = (value: Uint8Array) =>
        Number(algosdk.decodeUint64(Buffer.from(value), "mixed"));

      const findGlobalStateValue = (key: string) => {
        const entry = globalState.find(
          (state: any) => decodeBase64(state.key) === key,
        );
        if (entry) {
          return entry.value.type === 1
            ? decodeBase64(entry.value.bytes)
            : decodeUint64(entry.value.bytes);
        }
        return null;
      };

      const daoCreator = findGlobalStateValue("creator");
      const governanceTokenId = findGlobalStateValue("governance_token_id");

      return {
        governanceAppId: this.squadDAOAppId,
        creator: daoCreator,
        governanceTokenId: governanceTokenId,
        name: "Squad DAO", // Placeholder, ideally fetched from a metadata contract or passed during creation
        totalSupply: 1000000, // From PyTeal contract
      };
    } catch (error) {
      console.error("Error fetching Squad DAO info:", error);
      return null;
    }
  }

  public async createSquadDAO(
    squadName: string,
    initialMembers: string[],
  ): Promise<any> {
    // This function is a placeholder for future implementation if needed.
    // The actual DAO deployment is handled by deploySquadDAO on server startup.
    console.warn(
      "createSquadDAO is a placeholder and does not deploy a new DAO.",
    );
    return {};
  }

  public async optInToMatchVerification(userAddress: string): Promise<boolean> {
    if (!this.matchVerificationAppId) {
      console.error(
        "Match Verification App ID not set. Deploy the contract first.",
      );
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
        sender: userAddress,
        suggestedParams: suggestedParams,
        appIndex: this.matchVerificationAppId,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing opt-in transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = optInTxn.signTxn(creatorAccount.sk);
      const txId = optInTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `User ${userAddress} successfully opted into Match Verification App ID: ${this.matchVerificationAppId}`,
      );
      return true;
    } catch (error) {
      console.error(
        `Error opting in to Match Verification for ${userAddress}:`,
        error,
      );
      return false;
    }
  }

  public async submitMatchResult(
    matchId: string,
    homeTeam: string,
    awayTeam: string,
    homeScore: number,
    awayScore: number,
    submitter: string,
    metadata: string = "",
  ): Promise<string | null> {
    if (!this.matchVerificationAppId) {
      console.error(
        "Match Verification App ID not set. Deploy the contract first.",
      );
      return null;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("submit_match")),
        new Uint8Array(Buffer.from(matchId)),
        new Uint8Array(Buffer.from(homeTeam)),
        new Uint8Array(Buffer.from(awayTeam)),
        algosdk.encodeUint64(homeScore),
        algosdk.encodeUint64(awayScore),
        new Uint8Array(Buffer.from(metadata)),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: submitter,
        suggestedParams: suggestedParams,
        appIndex: this.matchVerificationAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing submit match transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Match result submitted by ${submitter} for Match ID: ${matchId}`,
      );
      return txId;
    } catch (error) {
      console.error(`Error submitting match result for ${submitter}:`, error);
      return null;
    }
  }

  public async verifyMatchResult(
    blockchainMatchId: string,
    verifier: string,
    verifierRole: string = "PLAYER",
  ): Promise<string | null> {
    if (!this.matchVerificationAppId) {
      console.error(
        "Match Verification App ID not set. Deploy the contract first.",
      );
      return null;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      // Calculate role weight
      const roleWeights: { [key: string]: number } = {
        PLAYER: 10,
        REFEREE: 50,
        COACH: 20,
        OFFICIAL: 30,
        SPECTATOR: 5,
      };
      const roleWeight = roleWeights[verifierRole] || 10;

      const appArgs = [
        new Uint8Array(Buffer.from("verify_match")),
        algosdk.encodeUint64(parseInt(blockchainMatchId)),
        algosdk.encodeUint64(1), // 1 = confirm, 0 = dispute
        algosdk.encodeUint64(roleWeight),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: verifier,
        suggestedParams: suggestedParams,
        appIndex: this.matchVerificationAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing verify match transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Match verified by ${verifier} for Match ID: ${blockchainMatchId}`,
      );
      return txId;
    } catch (error) {
      console.error(`Error verifying match result for ${verifier}:`, error);
      return null;
    }
  }

  public async disputeMatchResult(
    blockchainMatchId: string,
    disputer: string,
    reason: string,
    evidence: string = "",
  ): Promise<string | null> {
    if (!this.matchVerificationAppId) {
      console.error(
        "Match Verification App ID not set. Deploy the contract first.",
      );
      return null;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("dispute_match")),
        algosdk.encodeUint64(parseInt(blockchainMatchId)),
        new Uint8Array(Buffer.from(reason)),
        new Uint8Array(Buffer.from(evidence)),
      ];

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: disputer,
        suggestedParams: suggestedParams,
        appIndex: this.matchVerificationAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing dispute match transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Match disputed by ${disputer} for Match ID: ${blockchainMatchId}`,
      );
      return txId;
    } catch (error) {
      console.error(`Error disputing match result for ${disputer}:`, error);
      return null;
    }
  }

  public async updatePlayerReputation(
    playerAddress: string,
    reputationChange: number,
    reason: string,
  ): Promise<boolean> {
    if (!this.matchVerificationAppId) {
      console.error(
        "Match Verification App ID not set. Deploy the contract first.",
      );
      return false;
    }

    try {
      const suggestedParams = await this.algodClient
        .getTransactionParams()
        .do();

      const appArgs = [
        new Uint8Array(Buffer.from("update_reputation")),
        new Uint8Array(Buffer.from(playerAddress)),
        algosdk.encodeUint64(reputationChange),
        new Uint8Array(Buffer.from(reason)),
      ];

      const creatorMnemonic = process.env.ALGORAND_PRIVATE_KEY;
      if (!creatorMnemonic) {
        throw new Error(
          "ALGORAND_PRIVATE_KEY not set in .env for signing reputation update transaction.",
        );
      }
      const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);

      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        sender: creatorAccount.addr,
        suggestedParams: suggestedParams,
        appIndex: this.matchVerificationAppId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs: appArgs,
      });

      const signedTxn = appCallTxn.signTxn(creatorAccount.sk);
      const txId = appCallTxn.txID().toString();
      await this.algodClient.sendRawTransaction(signedTxn).do();
      await algosdk.waitForConfirmation(this.algodClient, txId, 4);

      console.log(
        `Reputation updated for ${playerAddress}: ${reputationChange > 0 ? "+" : ""}${reputationChange}`,
      );
      return true;
    } catch (error) {
      console.error(`Error updating reputation for ${playerAddress}:`, error);
      return false;
    }
  }

  public async getPlayerReputation(address: string): Promise<number> {
    if (!this.matchVerificationAppId) {
      console.warn(
        "Match Verification App ID not set. Cannot fetch player reputation.",
      );
      return 100; // Default reputation
    }

    try {
      const accountInfo = await this.algodClient
        .accountInformation(address)
        .do();
      const appLocalState = accountInfo.appsLocalState.find(
        (app: any) => app.id === this.matchVerificationAppId,
      );

      if (appLocalState && appLocalState.keyValue) {
        const reputationEntry = appLocalState.keyValue.find(
          (state: any) => {
            const keyBuffer = typeof state.key === 'string' 
              ? Buffer.from(state.key, "base64") 
              : Buffer.from(state.key);
            return keyBuffer.toString("utf8") === "user_reputation";
          }
        );
        if (reputationEntry) {
          const valueBuffer = typeof reputationEntry.value.bytes === 'string'
            ? Buffer.from(reputationEntry.value.bytes, "base64")
            : Buffer.from(reputationEntry.value.bytes);
          return Number(algosdk.decodeUint64(valueBuffer, "mixed"));
        }
      }
      return 100; // Default reputation if not found
    } catch (error) {
      console.error(`Error fetching player reputation for ${address}:`, error);
      return 100; // Default reputation on error
    }
  }

  public async getMatchVerificationInfo(
    blockchainMatchId: string,
  ): Promise<any> {
    if (!this.matchVerificationAppId) {
      console.warn(
        "Match Verification App ID not set. Cannot fetch match info.",
      );
      return null;
    }

    try {
      const appInfo = await this.algodClient
        .getApplicationByID(this.matchVerificationAppId)
        .do();
      const globalState = appInfo.params.globalState;

      const decodeBase64 = (value: Uint8Array) =>
        Buffer.from(value).toString("utf8");
      const decodeUint64 = (value: Uint8Array) =>
        Number(algosdk.decodeUint64(Buffer.from(value), "mixed"));

      const findGlobalStateValue = (key: string) => {
        const entry = globalState.find(
          (state: any) => decodeBase64(state.key) === key,
        );
        if (entry) {
          return entry.value.type === 1
            ? decodeBase64(entry.value.bytes)
            : decodeUint64(entry.value.bytes);
        }
        return null;
      };

      const matchId = blockchainMatchId;
      const submitter = findGlobalStateValue(`match_submitter_${matchId}`);
      const homeTeam = findGlobalStateValue(`match_home_team_${matchId}`);
      const awayTeam = findGlobalStateValue(`match_away_team_${matchId}`);
      const homeScore = findGlobalStateValue(`match_home_score_${matchId}`);
      const awayScore = findGlobalStateValue(`match_away_score_${matchId}`);
      const status = findGlobalStateValue(`match_status_${matchId}`);
      const verifications = findGlobalStateValue(
        `match_verifications_${matchId}`,
      );
      const disputes = findGlobalStateValue(`match_disputes_${matchId}`);
      const timestamp = findGlobalStateValue(`match_timestamp_${matchId}`);

      if (submitter) {
        return {
          blockchainMatchId: matchId,
          submitter,
          homeTeam,
          awayTeam,
          homeScore,
          awayScore,
          status,
          verifications,
          disputes,
          timestamp,
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching match verification info:", error);
      return null;
    }
  }

  public async createGlobalChallenge(
    challengeName: string,
    description: string,
    prizePool: number,
    endDate: Date,
  ): Promise<number | null> {
    // Implement creating global challenge
    return null;
  }
}

export default AlgorandService;
