import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('auth_token');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Auth link to add authorization header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          squads: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Squad: {
        fields: {
          members: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          matches: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      Match: {
        fields: {
          events: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          playerStats: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      SquadDAO: {
        fields: {
          proposals: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          members: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      ReputationProfile: {
        fields: {
          skillRatings: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          achievements: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          endorsements: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      GlobalChallenge: {
        fields: {
          participants: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          leaderboard: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      MarketplaceItem: {
        fields: {
          bids: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          transactions: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});