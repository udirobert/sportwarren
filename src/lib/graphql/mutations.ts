import { gql } from '@apollo/client';

// Squad DAO Mutations
export const CREATE_SQUAD_DAO = gql`
  mutation CreateSquadDAO($input: CreateSquadDAOInput!) {
    createSquadDAO(input: $input) {
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
    }
  }
`;

export const OPT_IN_TO_DAO = gql`
  mutation OptInToDAO($input: OptInToDAOInput!) {
    optInToDAO(input: $input) {
      id
      dao {
        id
        name
      }
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
`;

export const CREATE_PROPOSAL = gql`
  mutation CreateProposal($input: CreateProposalInput!) {
    createProposal(input: $input) {
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

export const VOTE_ON_PROPOSAL = gql`
  mutation VoteOnProposal($input: VoteOnProposalInput!) {
    voteOnProposal(input: $input) {
      id
      proposal {
        id
        description
      }
      voter
      voteType
      votingPower
      timestamp
      transactionId
    }
  }
`;

export const EXECUTE_PROPOSAL = gql`
  mutation ExecuteProposal($proposalId: Int!) {
    executeProposal(proposalId: $proposalId) {
      id
      description
      status
      executed
      votesFor
      votesAgainst
      totalVotes
    }
  }
`;

// Reputation System Mutations
export const CREATE_REPUTATION_PROFILE = gql`
  mutation CreateReputationProfile($input: CreateReputationProfileInput!) {
    createReputationProfile(input: $input) {
      id
      user {
        id
        name
      }
      algorandAddress
      reputationScore
      skillPoints
      reputationTokenBalance
      skillTokenBalance
      createdAt
    }
  }
`;

export const UPDATE_SKILL_RATING = gql`
  mutation UpdateSkillRating($input: UpdateSkillRatingInput!) {
    updateSkillRating(input: $input) {
      id
      profile {
        id
        algorandAddress
      }
      skillCategory
      rating
      maxRating
      verified
      verifier
      evidence
      lastUpdated
    }
  }
`;

export const ENDORSE_PLAYER = gql`
  mutation EndorsePlayer($input: EndorsePlayerInput!) {
    endorsePlayer(input: $input) {
      id
      profile {
        id
        algorandAddress
      }
      endorser
      endorserReputation
      endorserRole
      skillCategory
      rating
      comment
      weight
      verified
      timestamp
      transactionId
    }
  }
`;

export const VERIFY_ACHIEVEMENT = gql`
  mutation VerifyAchievement($input: VerifyAchievementInput!) {
    verifyAchievement(input: $input) {
      id
      profile {
        id
        algorandAddress
      }
      achievementId
      title
      description
      rarity
      points
      verified
      evidence
      dateEarned
      transactionId
    }
  }
`;

export const REGISTER_PROFESSIONAL_INTEREST = gql`
  mutation RegisterProfessionalInterest($input: RegisterProfessionalInterestInput!) {
    registerProfessionalInterest(input: $input) {
      id
      profile {
        id
        algorandAddress
      }
      scoutAddress
      scoutName
      organization
      interestLevel
      notes
      professionalBonus
      timestamp
      transactionId
    }
  }
`;

export const TRANSFER_REPUTATION = gql`
  mutation TransferReputation($input: TransferReputationInput!) {
    transferReputation(input: $input) {
      id
      algorandAddress
      reputationScore
      reputationTokenBalance
      updatedAt
    }
  }
`;

// Global Challenge Mutations
export const CREATE_GLOBAL_CHALLENGE = gql`
  mutation CreateGlobalChallenge($input: CreateGlobalChallengeInput!) {
    createGlobalChallenge(input: $input) {
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
      verificationThreshold
      blockchainTxId
      createdAt
    }
  }
`;

export const JOIN_CHALLENGE = gql`
  mutation JoinChallenge($input: JoinChallengeInput!) {
    joinChallenge(input: $input) {
      id
      challenge {
        id
        title
      }
      participant
      participantName
      reputationScore
      currentScore
      verified
      verificationCount
      joinedAt
    }
  }
`;

export const SUBMIT_CHALLENGE_PROGRESS = gql`
  mutation SubmitChallengeProgress($input: SubmitChallengeProgressInput!) {
    submitChallengeProgress(input: $input) {
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
      transactionId
    }
  }
`;

export const VERIFY_CHALLENGE_PROGRESS = gql`
  mutation VerifyChallengeProgress($input: VerifyChallengeProgressInput!) {
    verifyChallengeProgress(input: $input) {
      id
      progress {
        id
        score
      }
      verifier
      verifierReputation
      verificationType
      timestamp
      transactionId
    }
  }
`;

export const FINALIZE_CHALLENGE = gql`
  mutation FinalizeChallenge($input: FinalizeChallengeInput!) {
    finalizeChallenge(input: $input) {
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

// Marketplace Mutations
export const CREATE_MARKETPLACE_ITEM = gql`
  mutation CreateMarketplaceItem($input: CreateMarketplaceItemInput!) {
    createMarketplaceItem(input: $input) {
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
      createdAt
    }
  }
`;

export const UPDATE_MARKETPLACE_ITEM = gql`
  mutation UpdateMarketplaceItem($input: UpdateMarketplaceItemInput!) {
    updateMarketplaceItem(input: $input) {
      id
      title
      description
      price
      quantity
      availableQuantity
      imageUrl
      status
      updatedAt
    }
  }
`;

export const PURCHASE_MARKETPLACE_ITEM = gql`
  mutation PurchaseMarketplaceItem($input: PurchaseMarketplaceItemInput!) {
    purchaseMarketplaceItem(input: $input) {
      id
      item {
        id
        title
        imageUrl
      }
      buyer
      seller
      quantity
      pricePerItem
      totalPrice
      currency
      platformFee
      status
      blockchainTxId
      escrowAddress
      createdAt
    }
  }
`;

export const CREATE_MARKETPLACE_BID = gql`
  mutation CreateMarketplaceBid($input: CreateMarketplaceBidInput!) {
    createMarketplaceBid(input: $input) {
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

export const ACCEPT_MARKETPLACE_BID = gql`
  mutation AcceptMarketplaceBid($bidId: ID!) {
    acceptMarketplaceBid(bidId: $bidId) {
      id
      item {
        id
        title
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

export const ADD_TO_FAVORITES = gql`
  mutation AddToFavorites($input: AddToFavoritesInput!) {
    addToFavorites(input: $input) {
      id
      title
      price
      currency
      imageUrl
      favoriteCount
    }
  }
`;

export const REMOVE_FROM_FAVORITES = gql`
  mutation RemoveFromFavorites($input: AddToFavoritesInput!) {
    removeFromFavorites(input: $input) {
      id
      title
      favoriteCount
    }
  }
`;

// Match Verification Mutations
export const SUBMIT_MATCH_RESULT = gql`
  mutation SubmitMatchResult($input: SubmitMatchResultInput!) {
    submitMatchResult(input: $input) {
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
      metadata
      blockchainTxId
    }
  }
`;

export const VERIFY_MATCH = gql`
  mutation VerifyMatch($input: VerifyMatchInput!) {
    verifyMatch(input: $input) {
      id
      matchVerification {
        id
        status
        currentVerifications
      }
      verifier
      verifierReputation
      verifierRole
      weight
      timestamp
      transactionId
    }
  }
`;

export const DISPUTE_MATCH = gql`
  mutation DisputeMatch($input: DisputeMatchInput!) {
    disputeMatch(input: $input) {
      id
      matchVerification {
        id
        status
        disputeCount
      }
      disputer
      disputerReputation
      reason
      evidence
      weight
      timestamp
      status
      transactionId
    }
  }
`;

export const UPDATE_REPUTATION = gql`
  mutation UpdateReputation($input: UpdateReputationInput!) {
    updateReputation(input: $input) {
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