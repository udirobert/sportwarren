/**
 * SportWarren Type Definitions
 * Consolidated single source of truth for all types
 */

// ============================================================================
// MATCH DOMAIN
// ============================================================================

export type MatchStatus = 'pending' | 'verified' | 'disputed' | 'finalized';
export type VerificationRole = 'player' | 'captain' | 'referee' | 'spectator';
export type TrustTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface MatchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  submitter: string;
  submitterTeam: 'home' | 'away';
  timestamp: Date;
  verifications: Verification[];
  status: MatchStatus;
  requiredVerifications: number;
  evidence?: MatchEvidence;
  consensus?: MatchConsensus;
  trustScore?: number;
}

export interface Verification {
  verifier: string;
  verifierAddress: string;
  verified: boolean;
  timestamp: Date;
  role: VerificationRole;
  trustTier: TrustTier;
}

export interface MatchEvidence {
  photos: EvidenceItem[];
  voiceLogs: EvidenceItem[];
  gps?: GPSLocation;
}

export interface EvidenceItem {
  id: string;
  url: string;
  timestamp: Date;
  uploadedBy: string;
  type: 'photo' | 'voice';
}

export interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

export interface MatchConsensus {
  homeSubmitted: boolean;
  awaySubmitted: boolean;
  homeScore?: number;
  awayScore?: number;
  discrepancy: boolean;
  resolved: boolean;
  resolution?: 'home' | 'away' | 'average' | 'disputed';
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'card' | 'substitution' | 'voice-note' | 'photo';
  player?: string;
  playerId?: string;
  details?: string;
  timestamp: Date;
  minute?: number;
  evidence?: EvidenceItem;
}

// ============================================================================
// PLAYER DOMAIN
// ============================================================================

export interface Player {
  id: string;
  address: string;
  name: string;
  position: PlayerPosition;
  status: PlayerStatus;
  avatar?: string;
}

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'ST' | 'WG';
export type PlayerStatus = 'available' | 'injured' | 'suspended' | 'unavailable';

export interface PlayerAttributes {
  address: string;
  playerName: string;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  reputationScore: number;
  verifiedStats: boolean;
  skills: SkillRating[];
  form: FormRating;
  xp: PlayerXP;
  achievements: Achievement[];
  careerHighlights: CareerHighlight[];
  // Extended fields for reputation display
  endorsements?: Endorsement[];
  professionalInterest?: ProfessionalInterest[];
}

export interface Endorsement {
  endorser: string;
  endorserRole: 'teammate' | 'opponent' | 'coach' | 'referee';
  skill: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

export interface ProfessionalInterest {
  scoutName: string;
  organization: string;
  interestLevel: 'watching' | 'interested' | 'very_interested';
  notes: string;
  date: Date;
}

export interface SkillRating {
  skill: AttributeType;
  rating: number;        // Current value (0-99, FIFA-style)
  xp: number;           // Current XP toward next level
  xpToNextLevel: number;
  maxRating: number;
  verified: boolean;
  lastUpdated: Date;
  history: number[];    // Last 5 match ratings for form calculation
}

export type AttributeType = 
  | 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical'
  | 'gk_diving' | 'gk_handling' | 'gk_kicking' | 'gk_reflexes' | 'gk_speed' | 'gk_positioning';

export interface FormRating {
  current: number;      // -5 to +5 (FIFA-style form arrows)
  history: number[];    // Last 5 match ratings
  trend: 'up' | 'down' | 'stable';
}

export interface PlayerXP {
  level: number;
  totalXP: number;
  seasonXP: number;
  nextLevelXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  dateEarned: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  verified: boolean;
  icon?: string;
}

export interface CareerHighlight {
  id: string;
  title: string;
  description: string;
  date: Date;
  matchId?: string;
  verified: boolean;
}

// ============================================================================
// SQUAD DOMAIN
// ============================================================================

export interface Squad {
  id: string;
  name: string;
  shortName: string;
  founded: Date;
  homeGround: string;
  players: SquadPlayer[];
  treasury: Treasury;
  tactics: Tactics;
  reputation: number;
}

export interface SquadPlayer extends Player {
  squadNumber: number;
  contract: Contract;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface Contract {
  type: 'amateur' | 'semi-pro' | 'pro';
  wage: number;
  expiry: Date;
  releaseClause?: number;
}

export interface Treasury {
  balance: number;
  currency: string;
  transactions: TreasuryTransaction[];
  allowances: {
    weeklyWages: number;
    transferBudget: number;
    facilityUpgrades: number;
  };
}

export interface TreasuryTransaction {
  id: string;
  type: 'income' | 'expense';
  category: 'match_fee' | 'sponsor' | 'prize' | 'transfer_in' | 'wages' | 'transfer_out' | 'facility';
  amount: number;
  description: string;
  timestamp: Date;
  verified: boolean;
}

export interface Tactics {
  formation: Formation;
  style: PlayStyle;
  instructions: TeamInstructions;
  setPieces: SetPieceInstructions;
}

export type Formation = 
  | '4-4-2' | '4-3-3' | '4-2-3-1' | '4-5-1' | '4-1-4-1'
  | '3-5-2' | '3-4-3' | '5-3-2' | '5-4-1' | '4-3-1-2';

export type PlayStyle = 
  | 'balanced' | 'possession' | 'direct' | 'counter' | 'high_press' | 'low_block';

export interface TeamInstructions {
  width: 'narrow' | 'normal' | 'wide';
  tempo: 'slow' | 'normal' | 'fast';
  passing: 'short' | 'mixed' | 'long';
  pressing: 'low' | 'medium' | 'high';
  defensiveLine: 'deep' | 'normal' | 'high';
}

export interface SetPieceInstructions {
  corners: 'near_post' | 'far_post' | 'edge_of_box' | 'short';
  freeKicks: 'shoot' | 'cross' | 'short_pass';
  penalties: string; // Player ID
}

export interface TransferOffer {
  id: string;
  fromSquad: string;
  toSquad: string;
  player: SquadPlayer;
  offerAmount: number;
  offerType: 'transfer' | 'loan';
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  timestamp: Date;
  expiry: Date;
}

// ============================================================================
// RIVALRY DOMAIN
// ============================================================================

export interface Rivalry {
  id: string;
  squadA: string;
  squadB: string;
  name: string;
  description?: string;
  history: RivalryMatch[];
  stats: RivalryStats;
  intensity: number; // 1-10
  derbyBonuses?: DerbyBonus;
}

export interface RivalryMatch {
  matchId: string;
  date: Date;
  squadAScore: number;
  squadBScore: number;
  winner?: string;
  significance: 'league' | 'cup' | 'friendly' | 'playoff';
  memorable?: boolean;
}

export interface RivalryStats {
  played: number;
  squadAWins: number;
  squadBWins: number;
  draws: number;
  squadAGoals: number;
  squadBGoals: number;
}

export interface DerbyBonus {
  winnerXPBoost: number;
  loserXPPenalty: number;
  reputationBonus: number;
  fanEngagementBonus: number;
}

// ============================================================================
// AGENT DOMAIN (Avalanche)
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  owner: string;
  level: number;
  xp: number;
  abilities: AgentAbility[];
  specializations: string[];
  performance: AgentPerformance;
}

export type AgentType = 'scout' | 'tactical' | 'financial' | 'fitness' | 'analyst';

export interface AgentAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  lastUsed?: Date;
  active: boolean;
}

export interface AgentPerformance {
  tasksCompleted: number;
  successRate: number;
  earningsGenerated: number;
  lastActive: Date;
}

export interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  params: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// BLOCKCHAIN DOMAIN
// ============================================================================

export interface WalletState {
  address: string | null;
  connected: boolean;
  network: 'testnet' | 'mainnet';
  balance: number;
  assets: Asset[];
}

export interface Asset {
  id: string;
  amount: number;
  decimals: number;
  name: string;
  unitName: string;
  verified: boolean;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'asset_transfer' | 'app_call' | 'asset_opt_in';
  sender: string;
  receiver?: string;
  amount?: number;
  assetId?: string;
  fee: number;
  timestamp: Date;
  confirmed: boolean;
  note?: string;
}

// ============================================================================
// UI/UTILITY TYPES
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  unlockLevel?: number;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  compactMode: boolean;
  onboardingCompleted: boolean;
  preferredChain: 'algorand' | 'avalanche';
}
