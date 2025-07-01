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

  # DAO Types
  type SquadDAO {
    id: ID!
    squad: Squad!
    governanceAppId: Int!
    creator: String!
    governanceTokenId: Int!
    name: String!
    totalSupply: Int!
    createdAt: DateTime!
    proposals: [Proposal!]!
    members: [DAOMember!]!
  }

  type DAOMember {
    id: ID!
    dao: SquadDAO!
    user: User!
    tokenBalance: Int!
    votingPower: Int!
    joinedAt: DateTime!
    hasOptedIn: Boolean!
  }

  type Proposal {
    id: Int!
    dao: SquadDAO!
    proposer: String!
    description: String!
    type: ProposalType!
    startRound: Int!
    endRound: Int!
    votesFor: Int!
    votesAgainst: Int!
    totalVotes: Int!
    status: ProposalStatus!
    executed: Boolean!
    createdAt: DateTime!
    votes: [Vote!]!
  }

  type Vote {
    id: ID!
    proposal: Proposal!
    voter: String!
    voteType: VoteType!
    votingPower: Int!
    timestamp: DateTime!
    transactionId: String!
  }

  enum ProposalType {
    LINEUP
    TACTICS
    TRANSFER
    GENERAL
    GOVERNANCE
  }

  enum ProposalStatus {
    ACTIVE
    PASSED
    REJECTED
    EXECUTED
    EXPIRED
  }

  enum VoteType {
    FOR
    AGAINST
  }

  # Match Verification Types
  type MatchVerification {
    id: ID!
    match: Match!
    matchId: String!
    homeTeam: String!
    awayTeam: String!
    homeScore: Int!
    awayScore: Int!
    submitter: String!
    submitterReputation: Int!
    timestamp: DateTime!
    status: MatchVerificationStatus!
    requiredVerifications: Int!
    currentVerifications: Int!
    disputeCount: Int!
    verifications: [Verification!]!
    disputes: [Dispute!]!
    metadata: JSON
    blockchainTxId: String
  }

  type Verification {
    id: ID!
    matchVerification: MatchVerification!
    verifier: String!
    verifierReputation: Int!
    verifierRole: VerifierRole!
    weight: Int!
    timestamp: DateTime!
    transactionId: String!
  }

  type Dispute {
    id: ID!
    matchVerification: MatchVerification!
    disputer: String!
    disputerReputation: Int!
    reason: String!
    evidence: String
    weight: Int!
    timestamp: DateTime!
    status: DisputeStatus!
    resolution: String
    transactionId: String!
  }

  type UserReputation {
    id: ID!
    user: User!
    algorandAddress: String!
    reputation: Int!
    verificationCount: Int!
    successfulVerifications: Int!
    disputesRaised: Int!
    disputesWon: Int!
    lastUpdated: DateTime!
  }

  enum MatchVerificationStatus {
    PENDING
    VERIFIED
    DISPUTED
    RESOLVED
    REJECTED
  }

  enum VerifierRole {
    PLAYER
    REFEREE
    SPECTATOR
    COACH
    OFFICIAL
  }

  enum DisputeStatus {
    OPEN
    INVESTIGATING
    RESOLVED
    DISMISSED
  }

  # Reputation System Types
  type ReputationProfile {
    id: ID!
    user: User!
    algorandAddress: String!
    reputationScore: Int!
    skillPoints: Int!
    verificationCount: Int!
    endorsementCount: Int!
    professionalScore: Int!
    reputationTokenBalance: Float!
    skillTokenBalance: Float!
    skillRatings: [SkillRating!]!
    achievements: [ReputationAchievement!]!
    endorsements: [PlayerEndorsement!]!
    professionalInterests: [ProfessionalInterest!]!
    careerHighlights: [CareerHighlight!]!
    portableIdentity: PortableIdentity!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type SkillRating {
    id: ID!
    profile: ReputationProfile!
    skillCategory: SkillCategory!
    rating: Int!
    maxRating: Int!
    verified: Boolean!
    verifier: String
    evidence: String
    lastUpdated: DateTime!
    verificationHistory: [SkillVerification!]!
  }

  type SkillVerification {
    id: ID!
    skillRating: SkillRating!
    verifier: String!
    verifierReputation: Int!
    rating: Int!
    evidence: String
    timestamp: DateTime!
    transactionId: String!
  }

  type ReputationAchievement {
    id: ID!
    profile: ReputationProfile!
    achievementId: String!
    title: String!
    description: String!
    rarity: AchievementRarity!
    points: Int!
    verified: Boolean!
    evidence: String
    dateEarned: DateTime!
    transactionId: String
  }

  type PlayerEndorsement {
    id: ID!
    profile: ReputationProfile!
    endorser: String!
    endorserReputation: Int!
    endorserRole: EndorserRole!
    skillCategory: SkillCategory!
    rating: Int!
    comment: String!
    weight: Int!
    verified: Boolean!
    timestamp: DateTime!
    transactionId: String!
  }

  type ProfessionalInterest {
    id: ID!
    profile: ReputationProfile!
    scoutAddress: String!
    scoutName: String!
    organization: String!
    interestLevel: InterestLevel!
    notes: String!
    professionalBonus: Int!
    timestamp: DateTime!
    transactionId: String!
  }

  type CareerHighlight {
    id: ID!
    profile: ReputationProfile!
    title: String!
    description: String!
    matchId: String
    verified: Boolean!
    evidence: String
    date: DateTime!
    reputationImpact: Int!
  }

  type PortableIdentity {
    id: ID!
    profile: ReputationProfile!
    identityHash: String!
    verifiedSkills: [String!]!
    totalReputation: Int!
    professionalCredentials: [String!]!
    crossPlatformVerified: Boolean!
    lastSynced: DateTime!
  }

  type ReputationToken {
    id: ID!
    tokenId: Int!
    name: String!
    symbol: String!
    decimals: Int!
    totalSupply: Float!
    description: String!
  }

  enum SkillCategory {
    SHOOTING
    PASSING
    DRIBBLING
    DEFENDING
    PHYSICAL
    MENTAL
    GOALKEEPING
    LEADERSHIP
    TEAMWORK
    POSITIONING
  }

  enum EndorserRole {
    TEAMMATE
    OPPONENT
    COACH
    REFEREE
    SCOUT
    OFFICIAL
  }

  enum InterestLevel {
    WATCHING
    INTERESTED
    VERY_INTERESTED
    TRIAL_OFFER
    CONTRACT_OFFER
  }

  # Global Challenge Platform Types
  type GlobalChallenge {
    id: ID!
    challengeId: Int!
    title: String!
    description: String!
    challengeType: ChallengeType!
    sponsor: String!
    creator: String!
    prizePool: Float!
    currency: ChallengeCurrency!
    minReputation: Int!
    maxParticipants: Int!
    currentParticipants: Int!
    startDate: DateTime!
    endDate: DateTime!
    status: ChallengeStatus!
    featured: Boolean!
    requirements: [String!]!
    participants: [ChallengeParticipant!]!
    leaderboard: [LeaderboardEntry!]!
    winner: String
    prizeDistributed: Float
    verificationThreshold: Int!
    blockchainTxId: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ChallengeParticipant {
    id: ID!
    challenge: GlobalChallenge!
    participant: String!
    participantName: String
    reputationScore: Int!
    currentScore: Int!
    verified: Boolean!
    verificationCount: Int!
    lastUpdate: DateTime
    evidence: String
    joinedAt: DateTime!
  }

  type LeaderboardEntry {
    rank: Int!
    participant: String!
    participantName: String
    score: Int!
    country: String
    verified: Boolean!
    reputationScore: Int!
    verificationCount: Int!
  }

  type ChallengeProgress {
    id: ID!
    challenge: GlobalChallenge!
    participant: String!
    score: Int!
    evidence: String!
    timestamp: DateTime!
    verified: Boolean!
    verifications: [ProgressVerification!]!
    transactionId: String!
  }

  type ProgressVerification {
    id: ID!
    progress: ChallengeProgress!
    verifier: String!
    verifierReputation: Int!
    verificationType: VerificationType!
    timestamp: DateTime!
    transactionId: String!
  }

  type ChallengeSponsor {
    id: ID!
    name: String!
    organization: String!
    algorandAddress: String!
    totalSponsored: Float!
    activeChallenges: Int!
    reputation: Int!
    verified: Boolean!
    logo: String
    website: String
  }

  type PlatformStats {
    totalChallenges: Int!
    activeChallenges: Int!
    totalPrizePool: Float!
    totalParticipants: Int!
    totalWinners: Int!
    averagePrizePool: Float!
    topSponsors: [ChallengeSponsor!]!
    featuredChallenges: [GlobalChallenge!]!
  }

  enum ChallengeType {
    GOALS
    ASSISTS
    CLEAN_SHEETS
    WINS
    MATCHES_PLAYED
    SKILL_RATING
    SPECIAL_EVENT
    TOURNAMENT
    SEASONAL
    CUSTOM
  }

  enum ChallengeStatus {
    UPCOMING
    ACTIVE
    FINALIZED
    COMPLETED
    CANCELLED
  }

  enum ChallengeCurrency {
    ALGO
    REP
    SKILL
    USD
    EUR
  }

  enum VerificationType {
    APPROVE
    DISPUTE
    NEUTRAL
  }

  # Marketplace Types
  type MarketplaceItem {
    id: ID!
    itemType: MarketplaceItemType!
    seller: String!
    sellerName: String
    title: String!
    description: String
    price: Float!
    currency: ChallengeCurrency!
    quantity: Int!
    availableQuantity: Int!
    metadata: JSON!
    imageUrl: String
    status: MarketplaceItemStatus!
    featured: Boolean!
    expiresAt: DateTime
    blockchainAssetId: Int
    collection: MarketplaceCollection
    bids: [MarketplaceBid!]!
    transactions: [MarketplaceTransaction!]!
    favoriteCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MarketplaceTransaction {
    id: ID!
    item: MarketplaceItem!
    buyer: String!
    buyerName: String
    seller: String!
    sellerName: String
    quantity: Int!
    pricePerItem: Float!
    totalPrice: Float!
    currency: ChallengeCurrency!
    platformFee: Float!
    status: TransactionStatus!
    blockchainTxId: String
    escrowAddress: String
    createdAt: DateTime!
    completedAt: DateTime
  }

  type MarketplaceBid {
    id: ID!
    item: MarketplaceItem!
    bidder: String!
    bidderName: String
    bidAmount: Float!
    currency: ChallengeCurrency!
    status: BidStatus!
    expiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MarketplaceCollection {
    id: ID!
    name: String!
    description: String
    creator: String!
    creatorName: String
    category: String!
    imageUrl: String
    bannerUrl: String
    verified: Boolean!
    totalItems: Int!
    totalVolume: Float!
    floorPrice: Float
    items: [MarketplaceItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MarketplaceStats {
    totalItems: Int!
    totalVolume: Float!
    totalTransactions: Int!
    activeListings: Int!
    averagePrice: Float!
    topCollections: [MarketplaceCollection!]!
    recentTransactions: [MarketplaceTransaction!]!
    trendingItems: [MarketplaceItem!]!
  }

  type UserMarketplaceProfile {
    userAddress: String!
    userName: String
    totalSales: Float!
    totalPurchases: Float!
    itemsListed: Int!
    itemsSold: Int!
    averageRating: Float
    joinedAt: DateTime!
    favorites: [MarketplaceItem!]!
    listings: [MarketplaceItem!]!
    purchases: [MarketplaceTransaction!]!
    sales: [MarketplaceTransaction!]!
  }

  enum MarketplaceItemType {
    REPUTATION_TOKEN
    SKILL_TOKEN
    ACHIEVEMENT_NFT
    SQUAD_MEMBERSHIP
    CHALLENGE_ENTRY
    CUSTOM
  }

  enum MarketplaceItemStatus {
    ACTIVE
    SOLD
    CANCELLED
    EXPIRED
  }

  enum TransactionStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  enum BidStatus {
    ACTIVE
    ACCEPTED
    REJECTED
    EXPIRED
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

  input CreateSquadDAOInput {
    squadId: ID!
    name: String!
  }

  input CreateProposalInput {
    daoId: ID!
    description: String!
    type: ProposalType!
    durationRounds: Int!
  }

  input VoteOnProposalInput {
    proposalId: Int!
    voteType: VoteType!
    userAddress: String!
  }

  input OptInToDAOInput {
    daoId: ID!
    userAddress: String!
  }

  input SubmitMatchResultInput {
    matchId: String!
    homeTeam: String!
    awayTeam: String!
    homeScore: Int!
    awayScore: Int!
    submitterAddress: String!
    metadata: JSON
  }

  input VerifyMatchInput {
    matchVerificationId: String!
    verifierAddress: String!
    verifierRole: VerifierRole!
  }

  input DisputeMatchInput {
    matchVerificationId: String!
    disputerAddress: String!
    reason: String!
    evidence: String
  }

  input UpdateReputationInput {
    userAddress: String!
    reputationChange: Int!
    reason: String!
  }

  input CreateReputationProfileInput {
    algorandAddress: String!
  }

  input UpdateSkillRatingInput {
    profileId: ID!
    skillCategory: SkillCategory!
    rating: Int!
    verifierAddress: String!
    evidence: String
  }

  input EndorsePlayerInput {
    profileId: ID!
    endorserAddress: String!
    endorserRole: EndorserRole!
    skillCategory: SkillCategory!
    rating: Int!
    comment: String!
  }

  input VerifyAchievementInput {
    profileId: ID!
    achievementId: String!
    title: String!
    description: String!
    rarity: AchievementRarity!
    evidence: String
  }

  input RegisterProfessionalInterestInput {
    profileId: ID!
    scoutAddress: String!
    scoutName: String!
    organization: String!
    interestLevel: InterestLevel!
    notes: String!
  }

  input AddCareerHighlightInput {
    profileId: ID!
    title: String!
    description: String!
    matchId: String
    evidence: String
  }

  input TransferReputationInput {
    fromAddress: String!
    toAddress: String!
    amount: Int!
  }

  input CreateGlobalChallengeInput {
    title: String!
    description: String!
    challengeType: ChallengeType!
    sponsor: String!
    prizePool: Float!
    currency: ChallengeCurrency!
    minReputation: Int!
    maxParticipants: Int!
    durationDays: Int!
    requirements: [String!]!
    featured: Boolean
  }

  input JoinChallengeInput {
    challengeId: Int!
    participantAddress: String!
  }

  input SubmitChallengeProgressInput {
    challengeId: Int!
    participantAddress: String!
    score: Int!
    evidence: String!
  }

  input VerifyChallengeProgressInput {
    challengeId: Int!
    participantAddress: String!
    verifierAddress: String!
    verificationType: VerificationType!
  }

  input FinalizeChallengeInput {
    challengeId: Int!
  }

  input DistributePrizesInput {
    challengeId: Int!
    winnerAddress: String!
    prizeAmount: Float!
  }

  input CreateMarketplaceItemInput {
    itemType: MarketplaceItemType!
    title: String!
    description: String
    price: Float!
    currency: ChallengeCurrency!
    quantity: Int!
    metadata: JSON
    imageUrl: String
    collectionId: ID
    expiresAt: DateTime
    blockchainAssetId: Int
  }

  input UpdateMarketplaceItemInput {
    itemId: ID!
    price: Float
    quantity: Int
    description: String
    imageUrl: String
    status: MarketplaceItemStatus
  }

  input CreateMarketplaceBidInput {
    itemId: ID!
    bidAmount: Float!
    currency: ChallengeCurrency!
    expiresAt: DateTime
  }

  input PurchaseMarketplaceItemInput {
    itemId: ID!
    quantity: Int!
    buyerAddress: String!
  }

  input CreateMarketplaceCollectionInput {
    name: String!
    description: String
    category: String!
    imageUrl: String
    bannerUrl: String
  }

  input AddToFavoritesInput {
    itemId: ID!
    userAddress: String!
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
    
    # DAO Queries
    squadDAO(id: ID!): SquadDAO
    squadDAOs: [SquadDAO!]!
    squadDAOBySquad(squadId: ID!): SquadDAO
    proposal(id: Int!): Proposal
    proposals(daoId: ID!): [Proposal!]!
    userDAOMembership(daoId: ID!, userAddress: String!): DAOMember
    
    # Match Verification Queries
    matchVerification(id: ID!): MatchVerification
    matchVerifications(status: MatchVerificationStatus): [MatchVerification!]!
    matchVerificationByMatch(matchId: String!): MatchVerification
    userReputation(userAddress: String!): UserReputation
    pendingVerifications(userAddress: String!): [MatchVerification!]!
    disputedMatches: [MatchVerification!]!
    
    # Reputation System Queries
    reputationProfile(id: ID!): ReputationProfile
    reputationProfileByAddress(algorandAddress: String!): ReputationProfile
    reputationProfiles(limit: Int, offset: Int): [ReputationProfile!]!
    topReputationProfiles(limit: Int): [ReputationProfile!]!
    skillRating(profileId: ID!, skillCategory: SkillCategory!): SkillRating
    playerEndorsements(profileId: ID!): [PlayerEndorsement!]!
    professionalInterests(profileId: ID!): [ProfessionalInterest!]!
    reputationTokens: [ReputationToken!]!
    portableIdentity(profileId: ID!): PortableIdentity
    
    # Global Challenge Platform Queries
    globalChallenge(id: ID!): GlobalChallenge
    globalChallenges(status: ChallengeStatus, limit: Int, offset: Int): [GlobalChallenge!]!
    featuredChallenges: [GlobalChallenge!]!
    challengesByType(challengeType: ChallengeType!): [GlobalChallenge!]!
    challengesBySponsor(sponsor: String!): [GlobalChallenge!]!
    userChallenges(participantAddress: String!): [GlobalChallenge!]!
    challengeLeaderboard(challengeId: Int!): [LeaderboardEntry!]!
    challengeParticipants(challengeId: Int!): [ChallengeParticipant!]!
    platformStats: PlatformStats!
    challengeSponsors: [ChallengeSponsor!]!
    
    # Marketplace Queries
    marketplaceItem(id: ID!): MarketplaceItem
    marketplaceItems(itemType: MarketplaceItemType, status: MarketplaceItemStatus, limit: Int, offset: Int): [MarketplaceItem!]!
    featuredMarketplaceItems: [MarketplaceItem!]!
    marketplaceItemsByCollection(collectionId: ID!): [MarketplaceItem!]!
    marketplaceItemsBySeller(sellerAddress: String!): [MarketplaceItem!]!
    marketplaceCollection(id: ID!): MarketplaceCollection
    marketplaceCollections(category: String, limit: Int, offset: Int): [MarketplaceCollection!]!
    marketplaceStats: MarketplaceStats!
    userMarketplaceProfile(userAddress: String!): UserMarketplaceProfile!
    marketplaceTransaction(id: ID!): MarketplaceTransaction
    userMarketplaceTransactions(userAddress: String!): [MarketplaceTransaction!]!
    marketplaceBids(itemId: ID!): [MarketplaceBid!]!
    userMarketplaceBids(userAddress: String!): [MarketplaceBid!]!
  }

  type Mutation {
    createSquad(input: CreateSquadInput!): Squad!
    joinSquad(squadId: ID!): SquadMember!
    createMatch(input: CreateMatchInput!): Match!
    addMatchEvent(input: AddMatchEventInput!): MatchEvent!
    updatePlayerStats(input: UpdatePlayerStatsInput!): MatchPlayerStats!
    updateMatchStatus(matchId: ID!, status: MatchStatus!): Match!
    
    # DAO Mutations
    createSquadDAO(input: CreateSquadDAOInput!): SquadDAO!
    optInToDAO(input: OptInToDAOInput!): DAOMember!
    createProposal(input: CreateProposalInput!): Proposal!
    voteOnProposal(input: VoteOnProposalInput!): Vote!
    executeProposal(proposalId: Int!): Proposal!
    
    # Match Verification Mutations
    submitMatchResult(input: SubmitMatchResultInput!): MatchVerification!
    verifyMatch(input: VerifyMatchInput!): Verification!
    disputeMatch(input: DisputeMatchInput!): Dispute!
    updateReputation(input: UpdateReputationInput!): UserReputation!
    
    # Reputation System Mutations
    createReputationProfile(input: CreateReputationProfileInput!): ReputationProfile!
    updateSkillRating(input: UpdateSkillRatingInput!): SkillRating!
    endorsePlayer(input: EndorsePlayerInput!): PlayerEndorsement!
    verifyAchievement(input: VerifyAchievementInput!): ReputationAchievement!
    registerProfessionalInterest(input: RegisterProfessionalInterestInput!): ProfessionalInterest!
    addCareerHighlight(input: AddCareerHighlightInput!): CareerHighlight!
    transferReputation(input: TransferReputationInput!): ReputationProfile!
    
    # Global Challenge Platform Mutations
    createGlobalChallenge(input: CreateGlobalChallengeInput!): GlobalChallenge!
    joinChallenge(input: JoinChallengeInput!): ChallengeParticipant!
    submitChallengeProgress(input: SubmitChallengeProgressInput!): ChallengeProgress!
    verifyChallengeProgress(input: VerifyChallengeProgressInput!): ProgressVerification!
    finalizeChallenge(input: FinalizeChallengeInput!): GlobalChallenge!
    distributePrizes(input: DistributePrizesInput!): GlobalChallenge!
    
    # Marketplace Mutations
    createMarketplaceItem(input: CreateMarketplaceItemInput!): MarketplaceItem!
    updateMarketplaceItem(input: UpdateMarketplaceItemInput!): MarketplaceItem!
    purchaseMarketplaceItem(input: PurchaseMarketplaceItemInput!): MarketplaceTransaction!
    createMarketplaceBid(input: CreateMarketplaceBidInput!): MarketplaceBid!
    acceptMarketplaceBid(bidId: ID!): MarketplaceTransaction!
    rejectMarketplaceBid(bidId: ID!): MarketplaceBid!
    createMarketplaceCollection(input: CreateMarketplaceCollectionInput!): MarketplaceCollection!
    addToFavorites(input: AddToFavoritesInput!): MarketplaceItem!
    removeFromFavorites(input: AddToFavoritesInput!): MarketplaceItem!
  }

  type Subscription {
    matchUpdated(matchId: ID!): Match!
    matchEventAdded(matchId: ID!): MatchEvent!
    squadUpdated(squadId: ID!): Squad!
    achievementUnlocked(userId: ID!): Achievement!
    
    # DAO Subscriptions
    proposalCreated(daoId: ID!): Proposal!
    proposalUpdated(proposalId: Int!): Proposal!
    voteAdded(proposalId: Int!): Vote!
    daoUpdated(daoId: ID!): SquadDAO!
    
    # Match Verification Subscriptions
    matchSubmitted: MatchVerification!
    matchVerified(matchVerificationId: ID!): MatchVerification!
    matchDisputed(matchVerificationId: ID!): MatchVerification!
    verificationAdded(matchVerificationId: ID!): Verification!
    disputeAdded(matchVerificationId: ID!): Dispute!
    reputationUpdated(userAddress: String!): UserReputation!
    
    # Reputation System Subscriptions
    reputationProfileUpdated(profileId: ID!): ReputationProfile!
    skillRatingUpdated(profileId: ID!): SkillRating!
    playerEndorsed(profileId: ID!): PlayerEndorsement!
    achievementVerified(profileId: ID!): ReputationAchievement!
    professionalInterestAdded(profileId: ID!): ProfessionalInterest!
    reputationTransferred(fromAddress: String!, toAddress: String!): ReputationProfile!
    
    # Global Challenge Platform Subscriptions
    challengeCreated: GlobalChallenge!
    challengeUpdated(challengeId: Int!): GlobalChallenge!
    challengeJoined(challengeId: Int!): ChallengeParticipant!
    challengeProgressSubmitted(challengeId: Int!): ChallengeProgress!
    challengeProgressVerified(challengeId: Int!): ProgressVerification!
    challengeFinalized(challengeId: Int!): GlobalChallenge!
    leaderboardUpdated(challengeId: Int!): [LeaderboardEntry!]!
    
    # Marketplace Subscriptions
    marketplaceItemCreated: MarketplaceItem!
    marketplaceItemUpdated(itemId: ID!): MarketplaceItem!
    marketplaceItemSold(itemId: ID!): MarketplaceTransaction!
    marketplaceBidCreated(itemId: ID!): MarketplaceBid!
    marketplaceBidAccepted(bidId: ID!): MarketplaceTransaction!
    priceAlert(userAddress: String!, itemId: ID!): MarketplaceItem!
  }
`;