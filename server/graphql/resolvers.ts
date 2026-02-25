import { Context } from '../context.js';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.services.dbService.getUserById(context.user.id);
    },

    squad: async (_: any, { id }: { id: string }, context: Context) => {
      return context.services.dbService.getSquadById(id);
    },

    squads: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.services.dbService.getUserSquads(context.user.id);
    },

    match: async (_: any, { id }: { id: string }, context: Context) => {
      return context.services.dbService.getMatchById(id);
    },

    matches: async (_: any, { squadId }: { squadId?: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.services.dbService.getMatches(squadId);
    },

    playerStats: async (_: any, { userId, squadId }: { userId: string; squadId: string }, context: Context) => {
      return context.services.dbService.getPlayerStats(userId, squadId);
    },

    achievements: async (_: any, { userId }: { userId: string }, context: Context) => {
      return context.services.dbService.getUserAchievements(userId);
    },

    leaderboard: async (_: any, { squadId, type }: { squadId?: string; type: string }, context: Context) => {
      return context.services.dbService.getLeaderboard(squadId, type);
    },

    // Player Analytics Queries
    playerAnalytics: async (_: any, { userId }: { userId: string }, context: Context) => {
      // This would fetch stored analytics or trigger new analysis
      return null; // Placeholder
    },

    matchPrediction: async (
      _: any,
      { matchId, teamStats, opponentStats }: { matchId?: string; teamStats?: any; opponentStats?: any },
      context: Context
    ) => {
      return null; // Placeholder
    },

    videoAnalysis: async (_: any, { id }: { id: string }, context: Context) => {
      return null; // Placeholder
    },

    videoAnalyses: async (_: any, { userId }: { userId: string }, context: Context) => {
      return []; // Placeholder
    },

    proBenchmarks: async (_: any, { position }: { position?: string }, context: Context) => {
      const benchmarks = {
        striker: {
          shot_accuracy: 0.75,
          avg_speed: 28.5,
          distance_per_match: 10.5,
          sprint_count: 45,
          successful_dribbles: 0.68,
          positioning_score: 8.5,
        },
        midfielder: {
          pass_accuracy: 0.88,
          avg_speed: 26.8,
          distance_per_match: 11.8,
          sprint_count: 38,
          successful_dribbles: 0.65,
          positioning_score: 8.2,
        },
        defender: {
          tackle_success: 0.82,
          avg_speed: 25.2,
          distance_per_match: 10.2,
          sprint_count: 32,
          aerial_duels: 0.74,
          positioning_score: 8.7,
        },
        goalkeeper: {
          save_percentage: 0.72,
          reaction_time: 0.35,
          distribution_accuracy: 0.76,
          positioning_score: 9.0,
        },
      };
      return position ? benchmarks[position as keyof typeof benchmarks] : benchmarks;
    },

    // DAO Queries
    squadDAO: async (_: any, { id }: { id: string }, context: Context) => {
      return context.services.dbService.getSquadDAOById(id);
    },

    squadDAOs: async (_: any, __: any, context: Context) => {
      return context.services.dbService.getAllSquadDAOs();
    },

    squadDAOBySquad: async (_: any, { squadId }: { squadId: string }, context: Context) => {
      return context.services.dbService.getSquadDAOBySquadId(squadId);
    },

    proposal: async (_: any, { id }: { id: number }, context: Context) => {
      return context.services.dbService.getProposal(id);
    },

    proposals: async (_: any, { daoId }: { daoId: string }, context: Context) => {
      return context.services.dbService.getProposals(daoId);
    },

    userDAOMembership: async (_: any, { daoId, userAddress }: { daoId: string; userAddress: string }, context: Context) => {
      return context.services.dbService.getDAOMember(daoId, userAddress);
    },
  },

  Mutation: {
    createSquad: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const squad = await context.services.dbService.createSquad({
        ...input,
        createdBy: context.user.id,
      });
      return squad;
    },

    joinSquad: async (_: any, { squadId }: { squadId: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.services.dbService.joinSquad(context.user.id, squadId);
    },

    createMatch: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const match = await context.services.dbService.createMatch(input);
      
      // Emit real-time update
      pubsub.publish(`SQUAD_UPDATED_${input.squadId}`, { squadUpdated: match.squad });
      
      return match;
    },

    addMatchEvent: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const event = await context.services.dbService.addMatchEvent(input);
      
      // Emit real-time updates
      pubsub.publish(`MATCH_EVENT_ADDED_${input.matchId}`, { matchEventAdded: event });
      pubsub.publish(`MATCH_UPDATED_${input.matchId}`, { matchUpdated: event.match });
      
      return event;
    },

    updatePlayerStats: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.services.dbService.updatePlayerStats(input);
    },

    updateMatchStatus: async (_: any, { matchId, status }: { matchId: string; status: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      const match = await context.services.dbService.updateMatchStatus(matchId, status);
      
      // Emit real-time update
      pubsub.publish(`MATCH_UPDATED_${matchId}`, { matchUpdated: match });
      
      return match;
    },

    // DAO Mutations
    createSquadDAO: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      try {
        // Deploy the DAO smart contract
        const appId = await context.services.algorandService!.deploySquadDAO();
        if (!appId) {
          throw new Error('Failed to deploy DAO smart contract');
        }

        // Get DAO info from blockchain
        const daoInfo = await context.services.algorandService!.getSquadDAOInfo();
        if (!daoInfo) {
          throw new Error('Failed to get DAO info from blockchain');
        }

        // Create DAO record in database
        const dao = await context.services.dbService.createSquadDAO(
          input.squadId,
          daoInfo.governanceAppId,
          daoInfo.creator,
          daoInfo.governanceTokenId,
          input.name
        );

        // Emit real-time update
        pubsub.publish(`DAO_CREATED_${input.squadId}`, { daoCreated: dao });

        return dao;
      } catch (error) {
        console.error('Error creating Squad DAO:', error);
        throw new Error('Failed to create Squad DAO');
      }
    },

    optInToDAO: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      try {
        // Opt in to the DAO smart contract
        const success = await context.services.algorandService!.optInToSquadDAO(input.userAddress);
        if (!success) {
          throw new Error('Failed to opt in to DAO smart contract');
        }

        // Create or update DAO member record
        const member = await context.services.dbService.createDAOMember(
          input.daoId,
          context.user.id,
          input.userAddress
        );

        // Emit real-time update
        pubsub.publish(`DAO_UPDATED_${input.daoId}`, { daoUpdated: member.dao });

        return member;
      } catch (error) {
        console.error('Error opting in to DAO:', error);
        throw new Error('Failed to opt in to DAO');
      }
    },

    createProposal: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      try {
        // Get current round and calculate end round
        const networkStatus = await context.services.algorandService!.getNetworkStatus();
        const startRound = networkStatus.lastRound + 10; // Start in 10 rounds
        const endRound = startRound + input.durationRounds;

        // Create proposal on blockchain
        const success = await context.services.algorandService!.createProposal(
          input.userAddress || context.services.algorandService!.getWalletAddress(),
          input.description,
          startRound,
          endRound
        );

        if (!success) {
          throw new Error('Failed to create proposal on blockchain');
        }

        // Create proposal record in database
        const proposal = await context.services.dbService.createProposal(
          input.daoId,
          input.userAddress || context.services.algorandService!.getWalletAddress(),
          input.description,
          input.type,
          startRound,
          endRound,
          'pending' // Transaction ID will be updated later
        );

        // Emit real-time update
        pubsub.publish(`PROPOSAL_CREATED_${input.daoId}`, { proposalCreated: proposal });

        return proposal;
      } catch (error) {
        console.error('Error creating proposal:', error);
        throw new Error('Failed to create proposal');
      }
    },

    voteOnProposal: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      try {
        // Vote on blockchain
        const voteType = input.voteType === 'FOR' ? 1 : 0;
        const success = await context.services.algorandService!.voteOnProposal(
          input.userAddress,
          input.proposalId,
          voteType
        );

        if (!success) {
          throw new Error('Failed to vote on blockchain');
        }

        // Get user's voting power
        const tokenBalance = await context.services.algorandService!.getUserTokenBalance(input.userAddress);

        // Create vote record in database
        const vote = await context.services.dbService.createVote(
          input.proposalId,
          input.userAddress,
          input.voteType,
          tokenBalance,
          'pending' // Transaction ID will be updated later
        );

        // Update proposal vote counts
        const proposals = await context.services.algorandService!.getProposals();
        const proposal = proposals.find(p => p.id === input.proposalId);
        if (proposal) {
          await context.services.dbService.updateProposalVotes(
            input.proposalId,
            proposal.votesFor,
            proposal.votesAgainst
          );
        }

        // Emit real-time updates
        pubsub.publish(`VOTE_ADDED_${input.proposalId}`, { voteAdded: vote });
        pubsub.publish(`PROPOSAL_UPDATED_${input.proposalId}`, { proposalUpdated: proposal });

        return vote;
      } catch (error) {
        console.error('Error voting on proposal:', error);
        throw new Error('Failed to vote on proposal');
      }
    },

    executeProposal: async (_: any, { proposalId }: { proposalId: number }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      try {
        // Execute proposal on blockchain
        const success = await context.services.algorandService!.executeProposal(
          context.services.algorandService!.getWalletAddress(),
          proposalId
        );

        if (!success) {
          throw new Error('Failed to execute proposal on blockchain');
        }

        // Update proposal status in database
        const proposal = await context.services.dbService.updateProposalStatus(
          proposalId,
          'EXECUTED',
          true
        );

        // Emit real-time update
        pubsub.publish(`PROPOSAL_UPDATED_${proposalId}`, { proposalUpdated: proposal });

        return proposal;
      } catch (error) {
        console.error('Error executing proposal:', error);
        throw new Error('Failed to execute proposal');
      }
    },
  },

  Subscription: {
    matchUpdated: {
      subscribe: (_: any, { matchId }: { matchId: string }) => {
        return pubsub.asyncIterator(`MATCH_UPDATED_${matchId}`);
      },
    },

    matchEventAdded: {
      subscribe: (_: any, { matchId }: { matchId: string }) => {
        return pubsub.asyncIterator(`MATCH_EVENT_ADDED_${matchId}`);
      },
    },

    squadUpdated: {
      subscribe: (_: any, { squadId }: { squadId: string }) => {
        return pubsub.asyncIterator(`SQUAD_UPDATED_${squadId}`);
      },
    },

    achievementUnlocked: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator(`ACHIEVEMENT_UNLOCKED_${userId}`);
      },
    },

    // DAO Subscriptions
    proposalCreated: {
      subscribe: (_: any, { daoId }: { daoId: string }) => {
        return pubsub.asyncIterator(`PROPOSAL_CREATED_${daoId}`);
      },
    },

    proposalUpdated: {
      subscribe: (_: any, { proposalId }: { proposalId: number }) => {
        return pubsub.asyncIterator(`PROPOSAL_UPDATED_${proposalId}`);
      },
    },

    voteAdded: {
      subscribe: (_: any, { proposalId }: { proposalId: number }) => {
        return pubsub.asyncIterator(`VOTE_ADDED_${proposalId}`);
      },
    },

    daoUpdated: {
      subscribe: (_: any, { daoId }: { daoId: string }) => {
        return pubsub.asyncIterator(`DAO_UPDATED_${daoId}`);
      },
    },
  },

  // Field resolvers
  User: {
    squads: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getUserSquads(parent.id);
    },
    playerStats: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getPlayerStats(parent.id);
    },
  },

  Squad: {
    members: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadMembers(parent.id);
    },
    matches: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadMatches(parent.id);
    },
    stats: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadStats(parent.id);
    },
  },

  Match: {
    events: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getMatchEvents(parent.id);
    },
    playerStats: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getMatchPlayerStats(parent.id);
    },
  },

  // DAO Field Resolvers
  SquadDAO: {
    squad: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadById(parent.squad_id);
    },
    proposals: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getProposals(parent.id);
    },
    members: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getDAOMembers(parent.id);
    },
  },

  DAOMember: {
    dao: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadDAOById(parent.dao_id);
    },
    user: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getUserById(parent.user_id);
    },
  },

  Proposal: {
    dao: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getSquadDAOById(parent.dao_id);
    },
    votes: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getVotes(parent.id);
    },
  },

  Vote: {
    proposal: async (parent: any, _: any, context: Context) => {
      return context.services.dbService.getProposal(parent.proposal_id);
    },
  },
};