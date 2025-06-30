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
};