import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// WebSocket link for subscriptions (only initialize in browser)
const wsLink = typeof window !== 'undefined' 
  ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql',
        connectionParams: () => {
          const token = localStorage.getItem('sw_auth_token');
          return {
            authorization: token ? `Bearer ${token}` : '',
          };
        },
      })
    )
  : null;

// Auth link to add authorization header
const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('sw_auth_token')
    : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

// Helper to create array merge policy
const arrayMergePolicy = {
  merge(existing: unknown[] = [], incoming: unknown[]) {
    return incoming;
  },
};

// Apollo Client instance with simplified cache configuration
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      // Common pattern: arrays should be replaced on update, not merged
      User: {
        fields: {
          squads: arrayMergePolicy,
        },
      },
      Squad: {
        fields: {
          members: arrayMergePolicy,
          matches: arrayMergePolicy,
        },
      },
      Match: {
        fields: {
          events: arrayMergePolicy,
          playerStats: arrayMergePolicy,
        },
      },
      ReputationProfile: {
        fields: {
          skillRatings: arrayMergePolicy,
          achievements: arrayMergePolicy,
          endorsements: arrayMergePolicy,
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      // Use network-only for data that changes frequently
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Helper to reset cache (useful after logout)
export async function resetApolloCache(): Promise<void> {
  await apolloClient.resetStore();
}

// Helper to clear cache (more aggressive than reset)
export async function clearApolloCache(): Promise<void> {
  await apolloClient.clearStore();
}
