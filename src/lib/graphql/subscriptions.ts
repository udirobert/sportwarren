import { gql } from '@apollo/client';

// Squad DAO Subscriptions
export const PROPOSAL_CREATED = gql`
  subscription ProposalCreated($daoId: ID!) {
    proposalCreated(daoId: $daoId) {
      id
      dao {
        id
        name
      }
      proposer
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
  }
`;

export const PROPOSAL_UPDATED = gql`
  subscription ProposalUpdated($proposalId: Int!) {
    proposalUpdated(proposalId: $proposalId) {
      id
      description
      votesFor
      votesAgainst
      totalVotes
      status
      executed
    }
  }
`;

export const VOTE_ADDED = gql`
  subscription VoteAdded($proposalId: Int!) {
    voteAdded(proposalId: $proposalId) {
      id
      proposal {
        id
        votesFor
        votesAgainst
        totalVotes
      }
      voter
      voteType
      votingPower
      timestamp
      transactionId
    }
  }
`;

export const DAO_UPDATED = gql`
  subscription DAOUpdated($daoId: ID!) {
    daoUpdated(daoId: $daoId) {
      id
      name
      totalSupply
      members {
        id
        tokenBalance
        votingPower
        hasOptedIn
      }
    }
  }
`;

// Reputation System Subscriptions
export const REPUTATION_PROFILE_UPDATED = gql`
  subscription ReputationProfileUpdated($profileId: ID!) {
    reputationProfileUpdated(profileId: $profileId) {
      id
      reputationScore
      skillPoints
      verificationCount
      endorsementCount
      professionalScore
      reputationTokenBalance
      skillTokenBalance
      updatedAt
    }
  }
`;

export const SKILL_RATING_UPDATED = gql`
  subscription SkillRatingUpdated($profileId: ID!) {
    skillRatingUpdated(profileId: $profileId) {
      id
      skillCategory
      rating
      verified
      verifier
      lastUpdated
    }
  }
`;

export const PLAYER_ENDORSED = gql`
  subscription PlayerEndorsed($profileId: ID!) {
    playerEndorsed(profileId: $profileId) {
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
  }
`;

export const ACHIEVEMENT_VERIFIED = gql`
  subscription AchievementVerified($profileId: ID!) {
    achievementVerified(profileId: $profileId) {
      id
      achievementId
      title
      description
      rarity
      points
      verified
      dateEarned
    }
  }
`;

export const PROFESSIONAL_INTEREST_ADDED = gql`
  subscription ProfessionalInterestAdded($profileId: ID!) {
    professionalInterestAdded(profileId: $profileId) {
      id
      scoutAddress
      scoutName
      organization
      interestLevel
      notes
      professionalBonus
      timestamp
    }
  }
`;

// Global Challenge Subscriptions
export const CHALLENGE_CREATED = gql`
  subscription ChallengeCreated {
    challengeCreated {
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

export const CHALLENGE_UPDATED = gql`
  subscription ChallengeUpdated($challengeId: Int!) {
    challengeUpdated(challengeId: $challengeId) {
      id
      challengeId
      title
      currentParticipants
      status
      winner
      prizeDistributed
      updatedAt
    }
  }
`;

export const CHALLENGE_JOINED = gql`
  subscription ChallengeJoined($challengeId: Int!) {
    challengeJoined(challengeId: $challengeId) {
      id
      challenge {
        id
        currentParticipants
      }
      participant
      participantName
      reputationScore
      joinedAt
    }
  }
`;

export const CHALLENGE_PROGRESS_SUBMITTED = gql`
  subscription ChallengeProgressSubmitted($challengeId: Int!) {
    challengeProgressSubmitted(challengeId: $challengeId) {
      id
      challenge {
        id
        title
      }
      participant
      score
      evidence
      timestamp
      verified
    }
  }
`;

export const LEADERBOARD_UPDATED = gql`
  subscription LeaderboardUpdated($challengeId: Int!) {
    leaderboardUpdated(challengeId: $challengeId) {
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

export const CHALLENGE_FINALIZED = gql`
  subscription ChallengeFinalized($challengeId: Int!) {
    challengeFinalized(challengeId: $challengeId) {
      id
      challengeId
      title
      status
      winner
      prizeDistributed
      updatedAt
    }
  }
`;

// Marketplace Subscriptions
export const MARKETPLACE_ITEM_CREATED = gql`
  subscription MarketplaceItemCreated {
    marketplaceItemCreated {
      id
      itemType
      seller
      sellerName
      title
      description
      price
      currency
      quantity
      imageUrl
      status
      featured
      createdAt
    }
  }
`;

export const MARKETPLACE_ITEM_UPDATED = gql`
  subscription MarketplaceItemUpdated($itemId: ID!) {
    marketplaceItemUpdated(itemId: $itemId) {
      id
      title
      price
      quantity
      availableQuantity
      status
      updatedAt
    }
  }
`;

export const MARKETPLACE_ITEM_SOLD = gql`
  subscription MarketplaceItemSold($itemId: ID!) {
    marketplaceItemSold(itemId: $itemId) {
      id
      item {
        id
        title
        availableQuantity
        status
      }
      buyer
      seller
      quantity
      totalPrice
      currency
      status
      createdAt
    }
  }
`;

export const MARKETPLACE_BID_CREATED = gql`
  subscription MarketplaceBidCreated($itemId: ID!) {
    marketplaceBidCreated(itemId: $itemId) {
      id
      item {
        id
        title
      }
      bidder
      bidderName
      bidAmount
      currency
      status
      expiresAt
      createdAt
    }
  }
`;

export const MARKETPLACE_BID_ACCEPTED = gql`
  subscription MarketplaceBidAccepted($bidId: ID!) {
    marketplaceBidAccepted(bidId: $bidId) {
      id
      item {
        id
        title
        status
      }
      buyer
      seller
      totalPrice
      currency
      status
      createdAt
    }
  }
`;

export const PRICE_ALERT = gql`
  subscription PriceAlert($userAddress: String!, $itemId: ID!) {
    priceAlert(userAddress: $userAddress, itemId: $itemId) {
      id
      title
      price
      currency
      updatedAt
    }
  }
`;

// Match Verification Subscriptions
export const MATCH_SUBMITTED = gql`
  subscription MatchSubmitted {
    matchSubmitted {
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

export const MATCH_VERIFIED = gql`
  subscription MatchVerified($matchVerificationId: ID!) {
    matchVerified(matchVerificationId: $matchVerificationId) {
      id
      status
      currentVerifications
      disputeCount
      updatedAt
    }
  }
`;

export const MATCH_DISPUTED = gql`
  subscription MatchDisputed($matchVerificationId: ID!) {
    matchDisputed(matchVerificationId: $matchVerificationId) {
      id
      status
      disputeCount
      updatedAt
    }
  }
`;

export const VERIFICATION_ADDED = gql`
  subscription VerificationAdded($matchVerificationId: ID!) {
    verificationAdded(matchVerificationId: $matchVerificationId) {
      id
      verifier
      verifierReputation
      verifierRole
      weight
      timestamp
    }
  }
`;

export const DISPUTE_ADDED = gql`
  subscription DisputeAdded($matchVerificationId: ID!) {
    disputeAdded(matchVerificationId: $matchVerificationId) {
      id
      disputer
      disputerReputation
      reason
      evidence
      weight
      timestamp
      status
    }
  }
`;

export const REPUTATION_UPDATED = gql`
  subscription ReputationUpdated($userAddress: String!) {
    reputationUpdated(userAddress: $userAddress) {
      id
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