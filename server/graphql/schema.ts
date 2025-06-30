export const typeDefs = `#graphql
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    email: String!
    name: String
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
    squads: [Squad!]!
    playerStats: PlayerStats
  }

  type Squad {
    id: ID!
    name: String!
    description: String
    sport: SportType!
    createdAt: DateTime!
    updatedAt: DateTime!
    members: [SquadMember!]!
    matches: [Match!]!
    stats: SquadStats
  }

  type SquadMember {
    id: ID!
    user: User!
    squad: Squad!
    role: SquadRole!
    position: String
    joinedAt: DateTime!
    stats: PlayerStats
  }

  type Match {
    id: ID!
    squad: Squad!
    opponent: String!
    homeScore: Int!
    awayScore: Int!
    isHome: Boolean!
    venue: String
    date: DateTime!
    status: MatchStatus!
    events: [MatchEvent!]!
    playerStats: [MatchPlayerStats!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MatchEvent {
    id: ID!
    match: Match!
    type: EventType!
    player: User
    minute: Int
    description: String
    metadata: JSON
    createdAt: DateTime!
  }

  type MatchPlayerStats {
    id: ID!
    match: Match!
    player: User!
    goals: Int!
    assists: Int!
    rating: Float
    minutesPlayed: Int
    position: String
    metadata: JSON
  }

  type PlayerStats {
    id: ID!
    user: User!
    squad: Squad
    totalMatches: Int!
    totalGoals: Int!
    totalAssists: Int!
    averageRating: Float
    winRate: Float
    seasonStats: JSON
    careerStats: JSON
  }

  type SquadStats {
    id: ID!
    squad: Squad!
    totalMatches: Int!
    wins: Int!
    draws: Int!
    losses: Int!
    goalsFor: Int!
    goalsAgainst: Int!
    winRate: Float!
    currentStreak: Int!
    seasonStats: JSON
  }

  type Achievement {
    id: ID!
    user: User!
    type: AchievementType!
    title: String!
    description: String!
    rarity: AchievementRarity!
    points: Int!
    unlockedAt: DateTime!
    metadata: JSON
  }

  enum SportType {
    FOOTBALL
    BASKETBALL
    VOLLEYBALL
    NETBALL
  }

  enum SquadRole {
    CAPTAIN
    VICE_CAPTAIN
    REGULAR
    SUBSTITUTE
  }

  enum MatchStatus {
    SCHEDULED
    LIVE
    COMPLETED
    CANCELLED
  }

  enum EventType {
    GOAL
    ASSIST
    SUBSTITUTION
    YELLOW_CARD
    RED_CARD
    PENALTY
    OWN_GOAL
  }

  enum AchievementType {
    SCORING
    PLAYMAKING
    DEFENDING
    CONSISTENCY
    MILESTONE
    RIVALRY
    SEASONAL
  }

  enum AchievementRarity {
    COMMON
    RARE
    EPIC
    LEGENDARY
    MYTHIC
  }

  input CreateSquadInput {
    name: String!
    description: String
    sport: SportType!
  }

  input CreateMatchInput {
    squadId: ID!
    opponent: String!
    homeScore: Int!
    awayScore: Int!
    isHome: Boolean!
    venue: String
    date: DateTime!
  }

  input AddMatchEventInput {
    matchId: ID!
    type: EventType!
    playerId: ID
    minute: Int
    description: String
    metadata: JSON
  }

  input UpdatePlayerStatsInput {
    matchId: ID!
    playerId: ID!
    goals: Int
    assists: Int
    rating: Float
    minutesPlayed: Int
    position: String
  }

  type Query {
    me: User
    squad(id: ID!): Squad
    squads: [Squad!]!
    match(id: ID!): Match
    matches(squadId: ID): [Match!]!
    playerStats(userId: ID!, squadId: ID): PlayerStats
    achievements(userId: ID!): [Achievement!]!
    leaderboard(squadId: ID, type: String!): [PlayerStats!]!
  }

  type Mutation {
    createSquad(input: CreateSquadInput!): Squad!
    joinSquad(squadId: ID!): SquadMember!
    createMatch(input: CreateMatchInput!): Match!
    addMatchEvent(input: AddMatchEventInput!): MatchEvent!
    updatePlayerStats(input: UpdatePlayerStatsInput!): MatchPlayerStats!
    updateMatchStatus(matchId: ID!, status: MatchStatus!): Match!
  }

  type Subscription {
    matchUpdated(matchId: ID!): Match!
    matchEventAdded(matchId: ID!): MatchEvent!
    squadUpdated(squadId: ID!): Squad!
    achievementUnlocked(userId: ID!): Achievement!
  }
`;