import { gql } from '@apollo/client';

// Squad DAO Queries
export const GET_SQUAD_DAO = gql`
  query GetSquadDAO($id: ID!) {
    squadDAO(id: $id) {
      id
      squad {
        id
        name
      }
      governanceAppId
      creator
      governanceTokenId
      name
      totalSupply
      createdAt
      proposals {
        id
        description
        type
        startRound
        endRound
        votesFor
        votesAgainst
        totalVotes
        status
        executed
        createdAt
      }
      members {
        id
        user {
          id
          name
        }
        tokenBalance
        votingPower
        hasOptedIn
        joinedAt
      }
    }
  }
`;

export const GET_SQUAD_DAO_BY_SQUAD = gql`
  query GetSquadDAOBySquad($squadId: ID!) {
    squadDAOBySquad(squadId: $squadId) {
      id
      governanceAppId
      creator
      governanceTokenId
      name
      totalSupply
      createdAt
    }
  }
`;

// Reputation System Queries
export const GET_REPUTATION_PROFILE = gql`
  query GetReputationProfile($algorandAddress: String!) {
    reputationProfileByAddress(algorandAddress: $algorandAddress) {
      id
      user {
        id
        name
        email
      }
      algorandAddress
      reputationScore
      skillPoints
      verificationCount
      endorsementCount
      professionalScore
      reputationTokenBalance
      skillTokenBalance
      skillRatings {
        id
        skillCategory
        rating
        maxRating
        verified
        verifier
        evidence
        lastUpdated
      }
      achievements {
        id
        achievementId
        title
        description
        rarity
        points
        verified
        evidence
        dateEarned
      }
      endorsements {
        id
        endorser
        endorserReputation
        endorserRole
        skillCategory
        rating
        comment
        weight
        verified
        timestamp
      }
      professionalInterests {
        id
        scoutAddress
        scoutName
        organization
        interestLevel
        notes
        professionalBonus
        timestamp
      }
      portableIdentity {
        id
        identityHash
        verifiedSkills
        totalReputation
        professionalCredentials
        crossPlatformVerified
        lastSynced
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TOP_REPUTATION_PROFILES = gql`
  query GetTopReputationProfiles($limit: Int) {
    topReputationProfiles(limit: $limit) {
      id
      user {
        id
        name
      }
      algorandAddress
      reputationScore
      skillPoints
      professionalScore
      reputationTokenBalance
      skillTokenBalance
      createdAt
    }
  }
`;

// Global Challenge Queries
export const GET_GLOBAL_CHALLENGES = gql`
  query GetGlobalChallenges($status: ChallengeStatus, $limit: Int, $offset: Int) {
    globalChallenges(status: $status, limit: $limit, offset: $offset) {
      id
      challengeId
      title
      description
      challengeType
      sponsor
      creator
      prizePool
      currency
      minReputation
      maxParticipants
      currentParticipants
      startDate
      endDate
      status
      featured
      requirements
      winner
      prizeDistributed
      verificationThreshold
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURED_CHALLENGES = gql`
  query GetFeaturedChallenges {
    featuredChallenges {
      id
      challengeId
      title
      description
      challengeType
      sponsor
      creator
      prizePool
      currency
      minReputation
      maxParticipants
      currentParticipants
      startDate
      endDate
      status
      featured
      requirements
      createdAt
    }
  }
`;

export const GET_CHALLENGE_LEADERBOARD = gql`
  query GetChallengeLeaderboard($challengeId: Int!) {
    challengeLeaderboard(challengeId: $challengeId) {
      rank
      participant
      participantName
      score
      country
      verified
      reputationScore
      verificationCount
    }
  }
`;

export const GET_USER_CHALLENGES = gql`
  query GetUserChallenges($participantAddress: String!) {
    userChallenges(participantAddress: $participantAddress) {
      id
      challengeId
      title
      description
      challengeType
      sponsor
      prizePool
      currency
      status
      startDate
      endDate
      currentParticipants
      maxParticipants
    }
  }
`;

export const GET_PLATFORM_STATS = gql`
  query GetPlatformStats {
    platformStats {
      totalChallenges
      activeChallenges
      totalPrizePool
      totalParticipants
      totalWinners
      averagePrizePool
      topSponsors {
        id
        name
        organization
        totalSponsored
        activeChallenges
        verified
      }
      featuredChallenges {
        id
        title
        prizePool
        currency
        currentParticipants
        maxParticipants
      }
    }
  }
`;

// Marketplace Queries
export const GET_MARKETPLACE_ITEMS = gql`
  query GetMarketplaceItems($itemType: MarketplaceItemType, $status: MarketplaceItemStatus, $limit: Int, $offset: Int) {
    marketplaceItems(itemType: $itemType, status: $status, limit: $limit, offset: $offset) {
      id
      itemType
      seller
      sellerName
      title
      description
      price
      currency
      quantity
      availableQuantity
      metadata
      imageUrl
      status
      featured
      expiresAt
      blockchainAssetId
      favoriteCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURED_MARKETPLACE_ITEMS = gql`
  query GetFeaturedMarketplaceItems {
    featuredMarketplaceItems {
      id
      itemType
      seller
      sellerName
      title
      description
      price
      currency
      quantity
      availableQuantity
      imageUrl
      status
      featured
      favoriteCount
      createdAt
    }
  }
`;

export const GET_MARKETPLACE_ITEM = gql`
  query GetMarketplaceItem($id: ID!) {
    marketplaceItem(id: $id) {
      id
      itemType
      seller
      sellerName
      title
      description
      price
      currency
      quantity
      availableQuantity
      metadata
      imageUrl
      status
      featured
      expiresAt
      blockchainAssetId
      bids {
        id
        bidder
        bidderName
        bidAmount
        currency
        status
        expiresAt
        createdAt
      }
      transactions {
        id
        buyer
        buyerName
        quantity
        pricePerItem
        totalPrice
        currency
        status
        createdAt
        completedAt
      }
      favoriteCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_MARKETPLACE_PROFILE = gql`
  query GetUserMarketplaceProfile($userAddress: String!) {
    userMarketplaceProfile(userAddress: $userAddress) {
      userAddress
      userName
      totalSales
      totalPurchases
      itemsListed
      itemsSold
      averageRating
      joinedAt
      favorites {
        id
        title
        price
        currency
        imageUrl
        status
      }
      listings {
        id
        title
        price
        currency
        quantity
        availableQuantity
        status
        createdAt
      }
      purchases {
        id
        item {
          id
          title
          imageUrl
        }
        quantity
        totalPrice
        currency
        status
        createdAt
      }
      sales {
        id
        item {
          id
          title
          imageUrl
        }
        buyer
        buyerName
        quantity
        totalPrice
        currency
        status
        createdAt
      }
    }
  }
`;

export const GET_MARKETPLACE_STATS = gql`
  query GetMarketplaceStats {
    marketplaceStats {
      totalItems
      totalVolume
      totalTransactions
      activeListings
      averagePrice
      topCollections {
        id
        name
        totalItems
        totalVolume
        floorPrice
        verified
      }
      recentTransactions {
        id
        item {
          id
          title
          imageUrl
        }
        buyer
        seller
        totalPrice
        currency
        createdAt
      }
      trendingItems {
        id
        title
        price
        currency
        imageUrl
        favoriteCount
      }
    }
  }
`;

// Match Verification Queries
export const GET_MATCH_VERIFICATIONS = gql`
  query GetMatchVerifications($status: MatchVerificationStatus) {
    matchVerifications(status: $status) {
      id
      matchId
      homeTeam
      awayTeam
      homeScore
      awayScore
      submitter
      submitterReputation
      timestamp
      status
      requiredVerifications
      currentVerifications
      disputeCount
      verifications {
        id
        verifier
        verifierReputation
        verifierRole
        weight
        timestamp
      }
      disputes {
        id
        disputer
        disputerReputation
        reason
        evidence
        weight
        timestamp
        status
      }
      metadata
      blockchainTxId
    }
  }
`;

export const GET_PENDING_VERIFICATIONS = gql`
  query GetPendingVerifications($userAddress: String!) {
    pendingVerifications(userAddress: $userAddress) {
      id
      matchId
      homeTeam
      awayTeam
      homeScore
      awayScore
      submitter
      timestamp
      status
      requiredVerifications
      currentVerifications
    }
  }
`;

export const GET_USER_REPUTATION = gql`
  query GetUserReputation($userAddress: String!) {
    userReputation(userAddress: $userAddress) {
      id
      user {
        id
        name
      }
      algorandAddress
      reputation
      verificationCount
      successfulVerifications
      disputesRaised
      disputesWon
      lastUpdated
    }
  }
`;