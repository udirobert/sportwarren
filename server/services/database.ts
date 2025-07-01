import { Pool, PoolClient } from 'pg';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sportwarren',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      await this.initializeTables();
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  private async initializeTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create tables if they don't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          avatar TEXT,
          auth0_id VARCHAR(255) UNIQUE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS squads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          sport VARCHAR(50) NOT NULL,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS squad_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          squad_id UUID REFERENCES squads(id),
          role VARCHAR(50) DEFAULT 'REGULAR',
          position VARCHAR(50),
          joined_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, squad_id)
        );

        CREATE TABLE IF NOT EXISTS matches (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          squad_id UUID REFERENCES squads(id),
          opponent VARCHAR(255) NOT NULL,
          home_score INTEGER DEFAULT 0,
          away_score INTEGER DEFAULT 0,
          is_home BOOLEAN DEFAULT true,
          venue VARCHAR(255),
          match_date TIMESTAMP NOT NULL,
          status VARCHAR(50) DEFAULT 'SCHEDULED',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS match_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          match_id UUID REFERENCES matches(id),
          event_type VARCHAR(50) NOT NULL,
          player_id UUID REFERENCES users(id),
          minute INTEGER,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS match_player_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          match_id UUID REFERENCES matches(id),
          player_id UUID REFERENCES users(id),
          goals INTEGER DEFAULT 0,
          assists INTEGER DEFAULT 0,
          rating DECIMAL(3,1),
          minutes_played INTEGER,
          position VARCHAR(50),
          metadata JSONB,
          UNIQUE(match_id, player_id)
        );

        CREATE TABLE IF NOT EXISTS player_stats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          squad_id UUID REFERENCES squads(id),
          total_matches INTEGER DEFAULT 0,
          total_goals INTEGER DEFAULT 0,
          total_assists INTEGER DEFAULT 0,
          average_rating DECIMAL(3,1),
          win_rate DECIMAL(5,2),
          season_stats JSONB,
          career_stats JSONB,
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, squad_id)
        );

        CREATE TABLE IF NOT EXISTS achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          achievement_type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          rarity VARCHAR(50) NOT NULL,
          points INTEGER DEFAULT 0,
          unlocked_at TIMESTAMP DEFAULT NOW(),
          metadata JSONB
        );

        CREATE TABLE IF NOT EXISTS squad_daos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          squad_id UUID REFERENCES squads(id) UNIQUE,
          governance_app_id INTEGER UNIQUE NOT NULL,
          creator VARCHAR(255) NOT NULL,
          governance_token_id INTEGER NOT NULL,
          name VARCHAR(255) NOT NULL,
          total_supply INTEGER DEFAULT 1000000,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS dao_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          dao_id UUID REFERENCES squad_daos(id),
          user_id UUID REFERENCES users(id),
          algorand_address VARCHAR(255) NOT NULL,
          token_balance INTEGER DEFAULT 0,
          voting_power INTEGER DEFAULT 0,
          has_opted_in BOOLEAN DEFAULT false,
          joined_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(dao_id, user_id),
          UNIQUE(dao_id, algorand_address)
        );

        CREATE TABLE IF NOT EXISTS proposals (
          id SERIAL PRIMARY KEY,
          dao_id UUID REFERENCES squad_daos(id),
          proposer VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          proposal_type VARCHAR(50) NOT NULL,
          start_round INTEGER NOT NULL,
          end_round INTEGER NOT NULL,
          votes_for INTEGER DEFAULT 0,
          votes_against INTEGER DEFAULT 0,
          total_votes INTEGER DEFAULT 0,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          executed BOOLEAN DEFAULT false,
          transaction_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS votes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          proposal_id INTEGER REFERENCES proposals(id),
          voter VARCHAR(255) NOT NULL,
          vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('FOR', 'AGAINST')),
          voting_power INTEGER NOT NULL,
          transaction_id VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT NOW(),
          UNIQUE(proposal_id, voter)
        );

        CREATE TABLE IF NOT EXISTS match_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          match_id UUID REFERENCES matches(id),
          blockchain_match_id VARCHAR(255) UNIQUE NOT NULL,
          home_team VARCHAR(255) NOT NULL,
          away_team VARCHAR(255) NOT NULL,
          home_score INTEGER NOT NULL,
          away_score INTEGER NOT NULL,
          submitter VARCHAR(255) NOT NULL,
          submitter_reputation INTEGER DEFAULT 100,
          status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'DISPUTED', 'RESOLVED', 'REJECTED')),
          required_verifications INTEGER DEFAULT 3,
          current_verifications INTEGER DEFAULT 0,
          dispute_count INTEGER DEFAULT 0,
          metadata JSONB,
          blockchain_tx_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          match_verification_id UUID REFERENCES match_verifications(id),
          verifier VARCHAR(255) NOT NULL,
          verifier_reputation INTEGER NOT NULL,
          verifier_role VARCHAR(50) NOT NULL CHECK (verifier_role IN ('PLAYER', 'REFEREE', 'SPECTATOR', 'COACH', 'OFFICIAL')),
          weight INTEGER NOT NULL,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(match_verification_id, verifier)
        );

        CREATE TABLE IF NOT EXISTS disputes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          match_verification_id UUID REFERENCES match_verifications(id),
          disputer VARCHAR(255) NOT NULL,
          disputer_reputation INTEGER NOT NULL,
          reason TEXT NOT NULL,
          evidence TEXT,
          weight INTEGER NOT NULL,
          status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
          resolution TEXT,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(match_verification_id, disputer)
        );

        CREATE TABLE IF NOT EXISTS user_reputations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          algorand_address VARCHAR(255) UNIQUE NOT NULL,
          reputation INTEGER DEFAULT 100,
          verification_count INTEGER DEFAULT 0,
          successful_verifications INTEGER DEFAULT 0,
          disputes_raised INTEGER DEFAULT 0,
          disputes_won INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, algorand_address)
        );

        CREATE TABLE IF NOT EXISTS reputation_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id),
          algorand_address VARCHAR(255) UNIQUE NOT NULL,
          reputation_score INTEGER DEFAULT 1000,
          skill_points INTEGER DEFAULT 0,
          verification_count INTEGER DEFAULT 0,
          endorsement_count INTEGER DEFAULT 0,
          professional_score INTEGER DEFAULT 0,
          reputation_token_balance DECIMAL(20,6) DEFAULT 1000.0,
          skill_token_balance DECIMAL(20,6) DEFAULT 0.0,
          identity_hash VARCHAR(255),
          cross_platform_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, algorand_address)
        );

        CREATE TABLE IF NOT EXISTS skill_ratings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id),
          skill_category VARCHAR(50) NOT NULL CHECK (skill_category IN ('SHOOTING', 'PASSING', 'DRIBBLING', 'DEFENDING', 'PHYSICAL', 'MENTAL', 'GOALKEEPING', 'LEADERSHIP', 'TEAMWORK', 'POSITIONING')),
          rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 100),
          max_rating INTEGER DEFAULT 100,
          verified BOOLEAN DEFAULT false,
          verifier VARCHAR(255),
          evidence TEXT,
          last_updated TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(profile_id, skill_category)
        );

        CREATE TABLE IF NOT EXISTS skill_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          skill_rating_id UUID REFERENCES skill_ratings(id),
          verifier VARCHAR(255) NOT NULL,
          verifier_reputation INTEGER NOT NULL,
          rating INTEGER NOT NULL,
          evidence TEXT,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reputation_achievements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id),
          achievement_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          rarity VARCHAR(50) NOT NULL CHECK (rarity IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC')),
          points INTEGER NOT NULL,
          verified BOOLEAN DEFAULT false,
          evidence TEXT,
          date_earned TIMESTAMP DEFAULT NOW(),
          transaction_id VARCHAR(255),
          UNIQUE(profile_id, achievement_id)
        );

        CREATE TABLE IF NOT EXISTS player_endorsements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id),
          endorser VARCHAR(255) NOT NULL,
          endorser_reputation INTEGER NOT NULL,
          endorser_role VARCHAR(50) NOT NULL CHECK (endorser_role IN ('TEAMMATE', 'OPPONENT', 'COACH', 'REFEREE', 'SCOUT', 'OFFICIAL')),
          skill_category VARCHAR(50) NOT NULL CHECK (skill_category IN ('SHOOTING', 'PASSING', 'DRIBBLING', 'DEFENDING', 'PHYSICAL', 'MENTAL', 'GOALKEEPING', 'LEADERSHIP', 'TEAMWORK', 'POSITIONING')),
          rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 100),
          comment TEXT,
          weight INTEGER NOT NULL,
          verified BOOLEAN DEFAULT true,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(profile_id, endorser, skill_category)
        );

        CREATE TABLE IF NOT EXISTS professional_interests (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id),
          scout_address VARCHAR(255) NOT NULL,
          scout_name VARCHAR(255) NOT NULL,
          organization VARCHAR(255) NOT NULL,
          interest_level VARCHAR(50) NOT NULL CHECK (interest_level IN ('WATCHING', 'INTERESTED', 'VERY_INTERESTED', 'TRIAL_OFFER', 'CONTRACT_OFFER')),
          notes TEXT,
          professional_bonus INTEGER NOT NULL,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(profile_id, scout_address)
        );

        CREATE TABLE IF NOT EXISTS career_highlights (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          match_id UUID REFERENCES matches(id),
          verified BOOLEAN DEFAULT false,
          evidence TEXT,
          date DATE NOT NULL,
          reputation_impact INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS portable_identities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          profile_id UUID REFERENCES reputation_profiles(id) UNIQUE,
          identity_hash VARCHAR(255) UNIQUE NOT NULL,
          verified_skills JSONB DEFAULT '[]',
          total_reputation INTEGER NOT NULL,
          professional_credentials JSONB DEFAULT '[]',
          cross_platform_verified BOOLEAN DEFAULT false,
          last_synced TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS reputation_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          token_id INTEGER UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          decimals INTEGER NOT NULL,
          total_supply DECIMAL(30,6) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS global_challenges (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          challenge_id INTEGER UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          challenge_type VARCHAR(50) NOT NULL CHECK (challenge_type IN ('GOALS', 'ASSISTS', 'CLEAN_SHEETS', 'WINS', 'MATCHES_PLAYED', 'SKILL_RATING', 'SPECIAL_EVENT', 'TOURNAMENT', 'SEASONAL', 'CUSTOM')),
          sponsor VARCHAR(255) NOT NULL,
          creator VARCHAR(255) NOT NULL,
          prize_pool DECIMAL(20,6) NOT NULL,
          currency VARCHAR(10) NOT NULL CHECK (currency IN ('ALGO', 'REP', 'SKILL', 'USD', 'EUR')),
          min_reputation INTEGER DEFAULT 1000,
          max_participants INTEGER NOT NULL,
          current_participants INTEGER DEFAULT 0,
          start_date TIMESTAMP NOT NULL,
          end_date TIMESTAMP NOT NULL,
          status VARCHAR(50) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ACTIVE', 'FINALIZED', 'COMPLETED', 'CANCELLED')),
          featured BOOLEAN DEFAULT false,
          requirements JSONB DEFAULT '[]',
          winner VARCHAR(255),
          prize_distributed DECIMAL(20,6),
          verification_threshold INTEGER DEFAULT 3,
          blockchain_tx_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS challenge_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          challenge_id UUID REFERENCES global_challenges(id),
          participant VARCHAR(255) NOT NULL,
          participant_name VARCHAR(255),
          reputation_score INTEGER NOT NULL,
          current_score INTEGER DEFAULT 0,
          verified BOOLEAN DEFAULT false,
          verification_count INTEGER DEFAULT 0,
          last_update TIMESTAMP,
          evidence TEXT,
          joined_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(challenge_id, participant)
        );

        CREATE TABLE IF NOT EXISTS challenge_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          challenge_id UUID REFERENCES global_challenges(id),
          participant VARCHAR(255) NOT NULL,
          score INTEGER NOT NULL,
          evidence TEXT NOT NULL,
          verified BOOLEAN DEFAULT false,
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS progress_verifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          progress_id UUID REFERENCES challenge_progress(id),
          verifier VARCHAR(255) NOT NULL,
          verifier_reputation INTEGER NOT NULL,
          verification_type VARCHAR(50) NOT NULL CHECK (verification_type IN ('APPROVE', 'DISPUTE', 'NEUTRAL')),
          transaction_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(progress_id, verifier)
        );

        CREATE TABLE IF NOT EXISTS challenge_sponsors (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          organization VARCHAR(255) NOT NULL,
          algorand_address VARCHAR(255) UNIQUE NOT NULL,
          total_sponsored DECIMAL(20,6) DEFAULT 0,
          active_challenges INTEGER DEFAULT 0,
          reputation INTEGER DEFAULT 1000,
          verified BOOLEAN DEFAULT false,
          logo TEXT,
          website VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS marketplace_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('REPUTATION_TOKEN', 'SKILL_TOKEN', 'ACHIEVEMENT_NFT', 'SQUAD_MEMBERSHIP', 'CHALLENGE_ENTRY', 'CUSTOM')),
          seller VARCHAR(255) NOT NULL,
          seller_name VARCHAR(255),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(20,6) NOT NULL,
          currency VARCHAR(10) NOT NULL CHECK (currency IN ('ALGO', 'REP', 'SKILL', 'USD')),
          quantity INTEGER DEFAULT 1,
          available_quantity INTEGER DEFAULT 1,
          metadata JSONB DEFAULT '{}',
          image_url TEXT,
          status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SOLD', 'CANCELLED', 'EXPIRED')),
          featured BOOLEAN DEFAULT false,
          expires_at TIMESTAMP,
          blockchain_asset_id INTEGER,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS marketplace_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID REFERENCES marketplace_items(id),
          buyer VARCHAR(255) NOT NULL,
          buyer_name VARCHAR(255),
          seller VARCHAR(255) NOT NULL,
          seller_name VARCHAR(255),
          quantity INTEGER NOT NULL,
          price_per_item DECIMAL(20,6) NOT NULL,
          total_price DECIMAL(20,6) NOT NULL,
          currency VARCHAR(10) NOT NULL,
          platform_fee DECIMAL(20,6) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
          blockchain_tx_id VARCHAR(255),
          escrow_address VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS marketplace_bids (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID REFERENCES marketplace_items(id),
          bidder VARCHAR(255) NOT NULL,
          bidder_name VARCHAR(255),
          bid_amount DECIMAL(20,6) NOT NULL,
          currency VARCHAR(10) NOT NULL,
          status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS marketplace_collections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          creator VARCHAR(255) NOT NULL,
          creator_name VARCHAR(255),
          category VARCHAR(50) NOT NULL,
          image_url TEXT,
          banner_url TEXT,
          verified BOOLEAN DEFAULT false,
          total_items INTEGER DEFAULT 0,
          total_volume DECIMAL(20,6) DEFAULT 0,
          floor_price DECIMAL(20,6),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS marketplace_favorites (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_address VARCHAR(255) NOT NULL,
          item_id UUID REFERENCES marketplace_items(id),
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_address, item_id)
        );

        CREATE INDEX IF NOT EXISTS idx_squad_members_user_id ON squad_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_squad_members_squad_id ON squad_members(squad_id);
        CREATE INDEX IF NOT EXISTS idx_matches_squad_id ON matches(squad_id);
        CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
        CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);
        CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
        CREATE INDEX IF NOT EXISTS idx_squad_daos_squad_id ON squad_daos(squad_id);
        CREATE INDEX IF NOT EXISTS idx_dao_members_dao_id ON dao_members(dao_id);
        CREATE INDEX IF NOT EXISTS idx_dao_members_user_id ON dao_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_proposals_dao_id ON proposals(dao_id);
        CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
        CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter);
        CREATE INDEX IF NOT EXISTS idx_match_verifications_match_id ON match_verifications(match_id);
        CREATE INDEX IF NOT EXISTS idx_match_verifications_submitter ON match_verifications(submitter);
        CREATE INDEX IF NOT EXISTS idx_match_verifications_status ON match_verifications(status);
        CREATE INDEX IF NOT EXISTS idx_verifications_match_verification_id ON verifications(match_verification_id);
        CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON verifications(verifier);
        CREATE INDEX IF NOT EXISTS idx_disputes_match_verification_id ON disputes(match_verification_id);
        CREATE INDEX IF NOT EXISTS idx_disputes_disputer ON disputes(disputer);
        CREATE INDEX IF NOT EXISTS idx_user_reputations_algorand_address ON user_reputations(algorand_address);
        CREATE INDEX IF NOT EXISTS idx_user_reputations_user_id ON user_reputations(user_id);
        CREATE INDEX IF NOT EXISTS idx_reputation_profiles_algorand_address ON reputation_profiles(algorand_address);
        CREATE INDEX IF NOT EXISTS idx_reputation_profiles_user_id ON reputation_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_reputation_profiles_reputation_score ON reputation_profiles(reputation_score);
        CREATE INDEX IF NOT EXISTS idx_skill_ratings_profile_id ON skill_ratings(profile_id);
        CREATE INDEX IF NOT EXISTS idx_skill_ratings_skill_category ON skill_ratings(skill_category);
        CREATE INDEX IF NOT EXISTS idx_skill_verifications_skill_rating_id ON skill_verifications(skill_rating_id);
        CREATE INDEX IF NOT EXISTS idx_reputation_achievements_profile_id ON reputation_achievements(profile_id);
        CREATE INDEX IF NOT EXISTS idx_player_endorsements_profile_id ON player_endorsements(profile_id);
        CREATE INDEX IF NOT EXISTS idx_player_endorsements_endorser ON player_endorsements(endorser);
        CREATE INDEX IF NOT EXISTS idx_professional_interests_profile_id ON professional_interests(profile_id);
        CREATE INDEX IF NOT EXISTS idx_career_highlights_profile_id ON career_highlights(profile_id);
        CREATE INDEX IF NOT EXISTS idx_portable_identities_profile_id ON portable_identities(profile_id);
        CREATE INDEX IF NOT EXISTS idx_global_challenges_challenge_id ON global_challenges(challenge_id);
        CREATE INDEX IF NOT EXISTS idx_global_challenges_status ON global_challenges(status);
        CREATE INDEX IF NOT EXISTS idx_global_challenges_sponsor ON global_challenges(sponsor);
        CREATE INDEX IF NOT EXISTS idx_global_challenges_challenge_type ON global_challenges(challenge_type);
        CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
        CREATE INDEX IF NOT EXISTS idx_challenge_participants_participant ON challenge_participants(participant);
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON challenge_progress(challenge_id);
        CREATE INDEX IF NOT EXISTS idx_challenge_progress_participant ON challenge_progress(participant);
        CREATE INDEX IF NOT EXISTS idx_progress_verifications_progress_id ON progress_verifications(progress_id);
        CREATE INDEX IF NOT EXISTS idx_challenge_sponsors_algorand_address ON challenge_sponsors(algorand_address);
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_item_type ON marketplace_items(item_type);
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller ON marketplace_items(seller);
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON marketplace_items(status);
        CREATE INDEX IF NOT EXISTS idx_marketplace_items_currency ON marketplace_items(currency);
        CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_item_id ON marketplace_transactions(item_id);
        CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer);
        CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_seller ON marketplace_transactions(seller);
        CREATE INDEX IF NOT EXISTS idx_marketplace_bids_item_id ON marketplace_bids(item_id);
        CREATE INDEX IF NOT EXISTS idx_marketplace_bids_bidder ON marketplace_bids(bidder);
        CREATE INDEX IF NOT EXISTS idx_marketplace_favorites_user_address ON marketplace_favorites(user_address);
      `);
      console.log('✅ Database tables initialized');
    } finally {
      client.release();
    }
  }

  // User methods
  async getUserById(id: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  async createUser(userData: any): Promise<any> {
    const { email, name, avatar, auth0Id } = userData;
    const result = await this.pool.query(
      'INSERT INTO users (email, name, avatar, auth0_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, name, avatar, auth0Id]
    );
    return result.rows[0];
  }

  // Squad methods
  async createSquad(squadData: any): Promise<any> {
    const { name, description, sport, createdBy } = squadData;
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create squad
      const squadResult = await client.query(
        'INSERT INTO squads (name, description, sport, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, sport, createdBy]
      );
      const squad = squadResult.rows[0];
      
      // Add creator as captain
      await client.query(
        'INSERT INTO squad_members (user_id, squad_id, role) VALUES ($1, $2, $3)',
        [createdBy, squad.id, 'CAPTAIN']
      );
      
      await client.query('COMMIT');
      return squad;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSquadById(id: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM squads WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserSquads(userId: string): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT s.* FROM squads s
      JOIN squad_members sm ON s.id = sm.squad_id
      WHERE sm.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);
    return result.rows;
  }

  async joinSquad(userId: string, squadId: string): Promise<any> {
    const result = await this.pool.query(
      'INSERT INTO squad_members (user_id, squad_id) VALUES ($1, $2) RETURNING *',
      [userId, squadId]
    );
    return result.rows[0];
  }

  async getSquadMembers(squadId: string): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT sm.*, u.name, u.email, u.avatar
      FROM squad_members sm
      JOIN users u ON sm.user_id = u.id
      WHERE sm.squad_id = $1
      ORDER BY sm.joined_at
    `, [squadId]);
    return result.rows;
  }

  // Match methods
  async createMatch(matchData: any): Promise<any> {
    const { squadId, opponent, homeScore, awayScore, isHome, venue, date } = matchData;
    const result = await this.pool.query(
      'INSERT INTO matches (squad_id, opponent, home_score, away_score, is_home, venue, match_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [squadId, opponent, homeScore, awayScore, isHome, venue, date]
    );
    return result.rows[0];
  }

  async getMatchById(id: string): Promise<any> {
    const result = await this.pool.query('SELECT * FROM matches WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getMatches(squadId?: string): Promise<any[]> {
    let query = 'SELECT * FROM matches';
    let params: any[] = [];
    
    if (squadId) {
      query += ' WHERE squad_id = $1';
      params.push(squadId);
    }
    
    query += ' ORDER BY match_date DESC';
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getSquadMatches(squadId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM matches WHERE squad_id = $1 ORDER BY match_date DESC',
      [squadId]
    );
    return result.rows;
  }

  async updateMatchStatus(matchId: string, status: string): Promise<any> {
    const result = await this.pool.query(
      'UPDATE matches SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, matchId]
    );
    return result.rows[0];
  }

  // Match events
  async addMatchEvent(eventData: any): Promise<any> {
    const { matchId, type, playerId, minute, description, metadata } = eventData;
    const result = await this.pool.query(
      'INSERT INTO match_events (match_id, event_type, player_id, minute, description, metadata) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [matchId, type, playerId, minute, description, metadata]
    );
    return result.rows[0];
  }

  async getMatchEvents(matchId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM match_events WHERE match_id = $1 ORDER BY minute ASC, created_at ASC',
      [matchId]
    );
    return result.rows;
  }

  // Player stats
  async updatePlayerStats(statsData: any): Promise<any> {
    const { matchId, playerId, goals, assists, rating, minutesPlayed, position } = statsData;
    const result = await this.pool.query(
      `INSERT INTO match_player_stats (match_id, player_id, goals, assists, rating, minutes_played, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (match_id, player_id)
       DO UPDATE SET goals = $3, assists = $4, rating = $5, minutes_played = $6, position = $7
       RETURNING *`,
      [matchId, playerId, goals, assists, rating, minutesPlayed, position]
    );
    return result.rows[0];
  }

  async getMatchPlayerStats(matchId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM match_player_stats WHERE match_id = $1',
      [matchId]
    );
    return result.rows;
  }

  async getPlayerStats(userId: string, squadId?: string): Promise<any> {
    let query = 'SELECT * FROM player_stats WHERE user_id = $1';
    let params = [userId];
    
    if (squadId) {
      query += ' AND squad_id = $2';
      params.push(squadId);
    }
    
    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  async getSquadStats(squadId: string): Promise<any> {
    // Calculate squad statistics from matches
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN (is_home AND home_score > away_score) OR (NOT is_home AND away_score > home_score) THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN home_score = away_score THEN 1 ELSE 0 END) as draws,
        SUM(CASE WHEN (is_home AND home_score < away_score) OR (NOT is_home AND away_score < home_score) THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN is_home THEN home_score ELSE away_score END) as goals_for,
        SUM(CASE WHEN is_home THEN away_score ELSE home_score END) as goals_against
      FROM matches 
      WHERE squad_id = $1 AND status = 'COMPLETED'
    `, [squadId]);
    
    const stats = result.rows[0];
    const winRate = stats.total_matches > 0 ? (stats.wins / stats.total_matches) * 100 : 0;
    
    return {
      id: squadId,
      squad_id: squadId,
      total_matches: parseInt(stats.total_matches),
      wins: parseInt(stats.wins),
      draws: parseInt(stats.draws),
      losses: parseInt(stats.losses),
      goals_for: parseInt(stats.goals_for),
      goals_against: parseInt(stats.goals_against),
      win_rate: winRate,
      current_streak: 0, // TODO: Calculate streak
    };
  }

  // Achievements
  async getUserAchievements(userId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
      [userId]
    );
    return result.rows;
  }

  async getLeaderboard(squadId?: string, type: string = 'goals'): Promise<any[]> {
    let query = `
      SELECT ps.*, u.name, u.avatar
      FROM player_stats ps
      JOIN users u ON ps.user_id = u.id
    `;
    let params: any[] = [];
    
    if (squadId) {
      query += ' WHERE ps.squad_id = $1';
      params.push(squadId);
    }
    
    // Order by the requested type
    switch (type) {
      case 'goals':
        query += ' ORDER BY ps.total_goals DESC';
        break;
      case 'assists':
        query += ' ORDER BY ps.total_assists DESC';
        break;
      case 'rating':
        query += ' ORDER BY ps.average_rating DESC';
        break;
      default:
        query += ' ORDER BY ps.total_goals DESC';
    }
    
    query += ' LIMIT 10';
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  // DAO methods
  async createSquadDAO(squadId: string, governanceAppId: number, creator: string, governanceTokenId: number, name: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO squad_daos (squad_id, governance_app_id, creator, governance_token_id, name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [squadId, governanceAppId, creator, governanceTokenId, name]
    );
    return result.rows[0];
  }

  async getSquadDAOById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT sd.*, s.name as squad_name, s.description as squad_description
       FROM squad_daos sd
       JOIN squads s ON sd.squad_id = s.id
       WHERE sd.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getSquadDAOBySquadId(squadId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT sd.*, s.name as squad_name, s.description as squad_description
       FROM squad_daos sd
       JOIN squads s ON sd.squad_id = s.id
       WHERE sd.squad_id = $1`,
      [squadId]
    );
    return result.rows[0];
  }

  async getAllSquadDAOs(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT sd.*, s.name as squad_name, s.description as squad_description
       FROM squad_daos sd
       JOIN squads s ON sd.squad_id = s.id
       ORDER BY sd.created_at DESC`
    );
    return result.rows;
  }

  async createDAOMember(daoId: string, userId: string, algorandAddress: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO dao_members (dao_id, user_id, algorand_address, token_balance, voting_power, has_opted_in)
       VALUES ($1, $2, $3, 100, 100, true)
       RETURNING *`,
      [daoId, userId, algorandAddress]
    );
    return result.rows[0];
  }

  async updateDAOMemberTokenBalance(daoId: string, algorandAddress: string, tokenBalance: number): Promise<any> {
    const result = await this.pool.query(
      `UPDATE dao_members 
       SET token_balance = $3, voting_power = $3, updated_at = NOW()
       WHERE dao_id = $1 AND algorand_address = $2
       RETURNING *`,
      [daoId, algorandAddress, tokenBalance]
    );
    return result.rows[0];
  }

  async getDAOMember(daoId: string, userAddress: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT dm.*, u.name as user_name, u.email as user_email
       FROM dao_members dm
       LEFT JOIN users u ON dm.user_id = u.id
       WHERE dm.dao_id = $1 AND dm.algorand_address = $2`,
      [daoId, userAddress]
    );
    return result.rows[0];
  }

  async getDAOMembers(daoId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT dm.*, u.name as user_name, u.email as user_email
       FROM dao_members dm
       LEFT JOIN users u ON dm.user_id = u.id
       WHERE dm.dao_id = $1
       ORDER BY dm.joined_at ASC`,
      [daoId]
    );
    return result.rows;
  }

  async createProposal(daoId: string, proposer: string, description: string, proposalType: string, startRound: number, endRound: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO proposals (dao_id, proposer, description, proposal_type, start_round, end_round, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [daoId, proposer, description, proposalType, startRound, endRound, transactionId]
    );
    return result.rows[0];
  }

  async getProposal(id: number): Promise<any> {
    const result = await this.pool.query(
      `SELECT p.*, sd.name as dao_name
       FROM proposals p
       JOIN squad_daos sd ON p.dao_id = sd.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getProposals(daoId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT p.*, sd.name as dao_name
       FROM proposals p
       JOIN squad_daos sd ON p.dao_id = sd.id
       WHERE p.dao_id = $1
       ORDER BY p.created_at DESC`,
      [daoId]
    );
    return result.rows;
  }

  async updateProposalVotes(proposalId: number, votesFor: number, votesAgainst: number): Promise<any> {
    const totalVotes = votesFor + votesAgainst;
    const result = await this.pool.query(
      `UPDATE proposals 
       SET votes_for = $2, votes_against = $3, total_votes = $4, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [proposalId, votesFor, votesAgainst, totalVotes]
    );
    return result.rows[0];
  }

  async updateProposalStatus(proposalId: number, status: string, executed: boolean = false): Promise<any> {
    const result = await this.pool.query(
      `UPDATE proposals 
       SET status = $2, executed = $3, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [proposalId, status, executed]
    );
    return result.rows[0];
  }

  async createVote(proposalId: number, voter: string, voteType: string, votingPower: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO votes (proposal_id, voter, vote_type, voting_power, transaction_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [proposalId, voter, voteType, votingPower, transactionId]
    );
    return result.rows[0];
  }

  async getVotes(proposalId: number): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM votes WHERE proposal_id = $1 ORDER BY timestamp ASC`,
      [proposalId]
    );
    return result.rows;
  }

  async getVoteByVoter(proposalId: number, voter: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM votes WHERE proposal_id = $1 AND voter = $2`,
      [proposalId, voter]
    );
    return result.rows[0];
  }

  // Match Verification methods
  async createMatchVerification(matchId: string, blockchainMatchId: string, homeTeam: string, awayTeam: string, homeScore: number, awayScore: number, submitter: string, submitterReputation: number, metadata: any, blockchainTxId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO match_verifications (match_id, blockchain_match_id, home_team, away_team, home_score, away_score, submitter, submitter_reputation, metadata, blockchain_tx_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [matchId, blockchainMatchId, homeTeam, awayTeam, homeScore, awayScore, submitter, submitterReputation, metadata, blockchainTxId]
    );
    return result.rows[0];
  }

  async getMatchVerification(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT mv.*, m.venue, m.match_date
       FROM match_verifications mv
       LEFT JOIN matches m ON mv.match_id = m.id
       WHERE mv.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getMatchVerificationByBlockchainId(blockchainMatchId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT mv.*, m.venue, m.match_date
       FROM match_verifications mv
       LEFT JOIN matches m ON mv.match_id = m.id
       WHERE mv.blockchain_match_id = $1`,
      [blockchainMatchId]
    );
    return result.rows[0];
  }

  async getMatchVerificationByMatchId(matchId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT mv.*, m.venue, m.match_date
       FROM match_verifications mv
       LEFT JOIN matches m ON mv.match_id = m.id
       WHERE mv.match_id = $1`,
      [matchId]
    );
    return result.rows[0];
  }

  async getMatchVerifications(status?: string): Promise<any[]> {
    let query = `
      SELECT mv.*, m.venue, m.match_date
      FROM match_verifications mv
      LEFT JOIN matches m ON mv.match_id = m.id
    `;
    const params: any[] = [];

    if (status) {
      query += ' WHERE mv.status = $1';
      params.push(status);
    }

    query += ' ORDER BY mv.created_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async updateMatchVerificationStatus(id: string, status: string, currentVerifications?: number, disputeCount?: number): Promise<any> {
    let query = 'UPDATE match_verifications SET status = $2, updated_at = NOW()';
    const params = [id, status];

    if (currentVerifications !== undefined) {
      query += ', current_verifications = $3';
      params.push(currentVerifications);
    }

    if (disputeCount !== undefined) {
      const paramIndex = params.length + 1;
      query += `, dispute_count = $${paramIndex}`;
      params.push(disputeCount);
    }

    query += ' WHERE id = $1 RETURNING *';

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  async createVerification(matchVerificationId: string, verifier: string, verifierReputation: number, verifierRole: string, weight: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO verifications (match_verification_id, verifier, verifier_reputation, verifier_role, weight, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [matchVerificationId, verifier, verifierReputation, verifierRole, weight, transactionId]
    );
    return result.rows[0];
  }

  async getVerifications(matchVerificationId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM verifications WHERE match_verification_id = $1 ORDER BY created_at ASC`,
      [matchVerificationId]
    );
    return result.rows;
  }

  async createDispute(matchVerificationId: string, disputer: string, disputerReputation: number, reason: string, evidence: string, weight: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO disputes (match_verification_id, disputer, disputer_reputation, reason, evidence, weight, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [matchVerificationId, disputer, disputerReputation, reason, evidence, weight, transactionId]
    );
    return result.rows[0];
  }

  async getDisputes(matchVerificationId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM disputes WHERE match_verification_id = $1 ORDER BY created_at ASC`,
      [matchVerificationId]
    );
    return result.rows;
  }

  async updateDisputeStatus(id: string, status: string, resolution?: string): Promise<any> {
    let query = 'UPDATE disputes SET status = $2, updated_at = NOW()';
    const params = [id, status];

    if (resolution) {
      query += ', resolution = $3';
      params.push(resolution);
    }

    query += ' WHERE id = $1 RETURNING *';

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  async createUserReputation(userId: string, algorandAddress: string, reputation: number = 100): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO user_reputations (user_id, algorand_address, reputation)
       VALUES ($1, $2, $3)
       ON CONFLICT (algorand_address) DO UPDATE SET
       reputation = EXCLUDED.reputation,
       updated_at = NOW()
       RETURNING *`,
      [userId, algorandAddress, reputation]
    );
    return result.rows[0];
  }

  async getUserReputation(algorandAddress: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT ur.*, u.name as user_name, u.email as user_email
       FROM user_reputations ur
       LEFT JOIN users u ON ur.user_id = u.id
       WHERE ur.algorand_address = $1`,
      [algorandAddress]
    );
    return result.rows[0];
  }

  async updateUserReputation(algorandAddress: string, reputationChange: number, reason: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current reputation
      const currentResult = await client.query(
        'SELECT reputation FROM user_reputations WHERE algorand_address = $1',
        [algorandAddress]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('User reputation not found');
      }

      const currentReputation = currentResult.rows[0].reputation;
      const newReputation = Math.max(0, currentReputation + reputationChange); // Don't go below 0

      // Update reputation
      const result = await client.query(
        `UPDATE user_reputations 
         SET reputation = $2, updated_at = NOW()
         WHERE algorand_address = $1
         RETURNING *`,
        [algorandAddress, newReputation]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateUserReputationStats(algorandAddress: string, verificationCount?: number, successfulVerifications?: number, disputesRaised?: number, disputesWon?: number): Promise<any> {
    let query = 'UPDATE user_reputations SET updated_at = NOW()';
    const params = [algorandAddress];
    let paramIndex = 2;

    if (verificationCount !== undefined) {
      query += `, verification_count = verification_count + $${paramIndex}`;
      params.push(verificationCount);
      paramIndex++;
    }

    if (successfulVerifications !== undefined) {
      query += `, successful_verifications = successful_verifications + $${paramIndex}`;
      params.push(successfulVerifications);
      paramIndex++;
    }

    if (disputesRaised !== undefined) {
      query += `, disputes_raised = disputes_raised + $${paramIndex}`;
      params.push(disputesRaised);
      paramIndex++;
    }

    if (disputesWon !== undefined) {
      query += `, disputes_won = disputes_won + $${paramIndex}`;
      params.push(disputesWon);
      paramIndex++;
    }

    query += ' WHERE algorand_address = $1 RETURNING *';

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  async getPendingVerifications(userAddress: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT mv.*, m.venue, m.match_date
       FROM match_verifications mv
       LEFT JOIN matches m ON mv.match_id = m.id
       WHERE mv.status = 'PENDING' 
       AND mv.submitter != $1
       AND NOT EXISTS (
         SELECT 1 FROM verifications v 
         WHERE v.match_verification_id = mv.id 
         AND v.verifier = $1
       )
       ORDER BY mv.created_at ASC`,
      [userAddress]
    );
    return result.rows;
  }

  async getDisputedMatches(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT mv.*, m.venue, m.match_date
       FROM match_verifications mv
       LEFT JOIN matches m ON mv.match_id = m.id
       WHERE mv.status = 'DISPUTED'
       ORDER BY mv.created_at DESC`
    );
    return result.rows;
  }

  // Reputation System methods
  async createReputationProfile(userId: string, algorandAddress: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO reputation_profiles (user_id, algorand_address)
       VALUES ($1, $2)
       ON CONFLICT (algorand_address) DO UPDATE SET
       updated_at = NOW()
       RETURNING *`,
      [userId, algorandAddress]
    );
    
    // Create portable identity
    const identityHash = `identity_${algorandAddress}_${Date.now()}`;
    await this.pool.query(
      `INSERT INTO portable_identities (profile_id, identity_hash, total_reputation)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id) DO NOTHING`,
      [result.rows[0].id, identityHash, 1000]
    );
    
    return result.rows[0];
  }

  async getReputationProfile(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT rp.*, u.name as user_name, u.email as user_email
       FROM reputation_profiles rp
       LEFT JOIN users u ON rp.user_id = u.id
       WHERE rp.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getReputationProfileByAddress(algorandAddress: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT rp.*, u.name as user_name, u.email as user_email
       FROM reputation_profiles rp
       LEFT JOIN users u ON rp.user_id = u.id
       WHERE rp.algorand_address = $1`,
      [algorandAddress]
    );
    return result.rows[0];
  }

  async getReputationProfiles(limit: number = 50, offset: number = 0): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT rp.*, u.name as user_name, u.email as user_email
       FROM reputation_profiles rp
       LEFT JOIN users u ON rp.user_id = u.id
       ORDER BY rp.reputation_score DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async getTopReputationProfiles(limit: number = 10): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT rp.*, u.name as user_name, u.email as user_email
       FROM reputation_profiles rp
       LEFT JOIN users u ON rp.user_id = u.id
       ORDER BY rp.reputation_score DESC, rp.professional_score DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async updateReputationProfile(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getReputationProfile(id);
    }

    fields.push('updated_at = NOW()');

    const query = `
      UPDATE reputation_profiles 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async createSkillRating(profileId: string, skillCategory: string, rating: number, verifier?: string, evidence?: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO skill_ratings (profile_id, skill_category, rating, verified, verifier, evidence)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (profile_id, skill_category) DO UPDATE SET
       rating = EXCLUDED.rating,
       verified = EXCLUDED.verified,
       verifier = EXCLUDED.verifier,
       evidence = EXCLUDED.evidence,
       last_updated = NOW()
       RETURNING *`,
      [profileId, skillCategory, rating, !!verifier, verifier, evidence]
    );
    return result.rows[0];
  }

  async getSkillRating(profileId: string, skillCategory: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM skill_ratings WHERE profile_id = $1 AND skill_category = $2`,
      [profileId, skillCategory]
    );
    return result.rows[0];
  }

  async getSkillRatings(profileId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM skill_ratings WHERE profile_id = $1 ORDER BY skill_category`,
      [profileId]
    );
    return result.rows;
  }

  async createSkillVerification(skillRatingId: string, verifier: string, verifierReputation: number, rating: number, evidence: string, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO skill_verifications (skill_rating_id, verifier, verifier_reputation, rating, evidence, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [skillRatingId, verifier, verifierReputation, rating, evidence, transactionId]
    );
    return result.rows[0];
  }

  async getSkillVerifications(skillRatingId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM skill_verifications WHERE skill_rating_id = $1 ORDER BY created_at DESC`,
      [skillRatingId]
    );
    return result.rows;
  }

  async createReputationAchievement(profileId: string, achievementId: string, title: string, description: string, rarity: string, points: number, evidence?: string, transactionId?: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO reputation_achievements (profile_id, achievement_id, title, description, rarity, points, verified, evidence, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (profile_id, achievement_id) DO UPDATE SET
       verified = EXCLUDED.verified,
       evidence = EXCLUDED.evidence,
       transaction_id = EXCLUDED.transaction_id
       RETURNING *`,
      [profileId, achievementId, title, description, rarity, points, !!transactionId, evidence, transactionId]
    );
    return result.rows[0];
  }

  async getReputationAchievements(profileId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM reputation_achievements WHERE profile_id = $1 ORDER BY date_earned DESC`,
      [profileId]
    );
    return result.rows;
  }

  async createPlayerEndorsement(profileId: string, endorser: string, endorserReputation: number, endorserRole: string, skillCategory: string, rating: number, comment: string, weight: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO player_endorsements (profile_id, endorser, endorser_reputation, endorser_role, skill_category, rating, comment, weight, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (profile_id, endorser, skill_category) DO UPDATE SET
       endorser_reputation = EXCLUDED.endorser_reputation,
       rating = EXCLUDED.rating,
       comment = EXCLUDED.comment,
       weight = EXCLUDED.weight,
       transaction_id = EXCLUDED.transaction_id,
       created_at = NOW()
       RETURNING *`,
      [profileId, endorser, endorserReputation, endorserRole, skillCategory, rating, comment, weight, transactionId]
    );
    return result.rows[0];
  }

  async getPlayerEndorsements(profileId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM player_endorsements WHERE profile_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return result.rows;
  }

  async createProfessionalInterest(profileId: string, scoutAddress: string, scoutName: string, organization: string, interestLevel: string, notes: string, professionalBonus: number, transactionId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO professional_interests (profile_id, scout_address, scout_name, organization, interest_level, notes, professional_bonus, transaction_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (profile_id, scout_address) DO UPDATE SET
       scout_name = EXCLUDED.scout_name,
       organization = EXCLUDED.organization,
       interest_level = EXCLUDED.interest_level,
       notes = EXCLUDED.notes,
       professional_bonus = EXCLUDED.professional_bonus,
       transaction_id = EXCLUDED.transaction_id,
       created_at = NOW()
       RETURNING *`,
      [profileId, scoutAddress, scoutName, organization, interestLevel, notes, professionalBonus, transactionId]
    );
    return result.rows[0];
  }

  async getProfessionalInterests(profileId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM professional_interests WHERE profile_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return result.rows;
  }

  async createCareerHighlight(profileId: string, title: string, description: string, matchId?: string, evidence?: string, date?: Date, reputationImpact: number = 0): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO career_highlights (profile_id, title, description, match_id, evidence, date, reputation_impact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [profileId, title, description, matchId, evidence, date || new Date(), reputationImpact]
    );
    return result.rows[0];
  }

  async getCareerHighlights(profileId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM career_highlights WHERE profile_id = $1 ORDER BY date DESC`,
      [profileId]
    );
    return result.rows;
  }

  async getPortableIdentity(profileId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM portable_identities WHERE profile_id = $1`,
      [profileId]
    );
    return result.rows[0];
  }

  async updatePortableIdentity(profileId: string, updates: any): Promise<any> {
    const fields = [];
    const values = [profileId];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getPortableIdentity(profileId);
    }

    fields.push('updated_at = NOW()');

    const query = `
      UPDATE portable_identities 
      SET ${fields.join(', ')}
      WHERE profile_id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async createReputationToken(tokenId: number, name: string, symbol: string, decimals: number, totalSupply: number, description: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO reputation_tokens (token_id, name, symbol, decimals, total_supply, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (token_id) DO UPDATE SET
       name = EXCLUDED.name,
       symbol = EXCLUDED.symbol,
       decimals = EXCLUDED.decimals,
       total_supply = EXCLUDED.total_supply,
       description = EXCLUDED.description
       RETURNING *`,
      [tokenId, name, symbol, decimals, totalSupply, description]
    );
    return result.rows[0];
  }

  async getReputationTokens(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM reputation_tokens ORDER BY created_at ASC`
    );
    return result.rows;
  }

  // Global Challenge methods
  async createGlobalChallenge(challengeId: number, title: string, description: string, challengeType: string, sponsor: string, creator: string, prizePool: number, currency: string, minReputation: number, maxParticipants: number, startDate: Date, endDate: Date, requirements: string[], featured: boolean = false, blockchainTxId?: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO global_challenges (challenge_id, title, description, challenge_type, sponsor, creator, prize_pool, currency, min_reputation, max_participants, start_date, end_date, requirements, featured, blockchain_tx_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [challengeId, title, description, challengeType, sponsor, creator, prizePool, currency, minReputation, maxParticipants, startDate, endDate, JSON.stringify(requirements), featured, blockchainTxId, 'ACTIVE']
    );
    return result.rows[0];
  }

  async getGlobalChallenge(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM global_challenges WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getGlobalChallengeByBlockchainId(challengeId: number): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM global_challenges WHERE challenge_id = $1`,
      [challengeId]
    );
    return result.rows[0];
  }

  async getGlobalChallenges(status?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    let query = 'SELECT * FROM global_challenges';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getFeaturedChallenges(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM global_challenges WHERE featured = true AND status IN ('UPCOMING', 'ACTIVE') ORDER BY start_date ASC`
    );
    return result.rows;
  }

  async getChallengesByType(challengeType: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM global_challenges WHERE challenge_type = $1 AND status IN ('UPCOMING', 'ACTIVE') ORDER BY start_date ASC`,
      [challengeType]
    );
    return result.rows;
  }

  async getChallengesBySponsor(sponsor: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM global_challenges WHERE sponsor = $1 ORDER BY created_at DESC`,
      [sponsor]
    );
    return result.rows;
  }

  async updateGlobalChallenge(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getGlobalChallenge(id);
    }

    fields.push('updated_at = NOW()');

    const query = `
      UPDATE global_challenges 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async joinChallenge(challengeId: string, participant: string, participantName: string, reputationScore: number): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO challenge_participants (challenge_id, participant, participant_name, reputation_score)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (challenge_id, participant) DO NOTHING
       RETURNING *`,
      [challengeId, participant, participantName, reputationScore]
    );

    if (result.rows.length > 0) {
      // Update participant count
      await this.pool.query(
        `UPDATE global_challenges 
         SET current_participants = current_participants + 1
         WHERE id = $1`,
        [challengeId]
      );
    }

    return result.rows[0];
  }

  async getChallengeParticipants(challengeId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM challenge_participants WHERE challenge_id = $1 ORDER BY current_score DESC, joined_at ASC`,
      [challengeId]
    );
    return result.rows;
  }

  async submitChallengeProgress(challengeId: string, participant: string, score: number, evidence: string, transactionId: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Insert progress record
      const progressResult = await client.query(
        `INSERT INTO challenge_progress (challenge_id, participant, score, evidence, transaction_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [challengeId, participant, score, evidence, transactionId]
      );

      // Update participant's current score if higher
      await client.query(
        `UPDATE challenge_participants 
         SET current_score = GREATEST(current_score, $3), last_update = NOW()
         WHERE challenge_id = $1 AND participant = $2`,
        [challengeId, participant, score]
      );

      await client.query('COMMIT');
      return progressResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY current_score DESC, verification_count DESC, joined_at ASC) as rank,
         participant,
         participant_name,
         current_score as score,
         'Unknown' as country,
         verified,
         reputation_score,
         verification_count
       FROM challenge_participants 
       WHERE challenge_id = $1 
       ORDER BY current_score DESC, verification_count DESC, joined_at ASC`,
      [challengeId]
    );
    return result.rows;
  }

  // Marketplace methods
  async createMarketplaceItem(itemType: string, seller: string, sellerName: string, title: string, description: string, price: number, currency: string, quantity: number, metadata: any, imageUrl?: string, collectionId?: string, expiresAt?: Date, blockchainAssetId?: number): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO marketplace_items (item_type, seller, seller_name, title, description, price, currency, quantity, available_quantity, metadata, image_url, expires_at, blockchain_asset_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12)
       RETURNING *`,
      [itemType, seller, sellerName, title, description, price, currency, quantity, metadata, imageUrl, expiresAt, blockchainAssetId]
    );
    return result.rows[0];
  }

  async getMarketplaceItem(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM marketplace_items WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getMarketplaceItems(itemType?: string, status?: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    let query = 'SELECT * FROM marketplace_items WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (itemType) {
      query += ` AND item_type = $${paramIndex}`;
      params.push(itemType);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getFeaturedMarketplaceItems(): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM marketplace_items WHERE featured = true AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 20`
    );
    return result.rows;
  }

  async getMarketplaceItemsBySeller(sellerAddress: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM marketplace_items WHERE seller = $1 ORDER BY created_at DESC`,
      [sellerAddress]
    );
    return result.rows;
  }

  async updateMarketplaceItem(id: string, updates: any): Promise<any> {
    const fields = [];
    const values = [id];
    let paramIndex = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.getMarketplaceItem(id);
    }

    fields.push('updated_at = NOW()');

    const query = `
      UPDATE marketplace_items 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async createMarketplaceTransaction(itemId: string, buyer: string, buyerName: string, seller: string, sellerName: string, quantity: number, pricePerItem: number, totalPrice: number, currency: string, platformFee: number, blockchainTxId?: string, escrowAddress?: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create transaction
      const transactionResult = await client.query(
        `INSERT INTO marketplace_transactions (item_id, buyer, buyer_name, seller, seller_name, quantity, price_per_item, total_price, currency, platform_fee, blockchain_tx_id, escrow_address, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
         RETURNING *`,
        [itemId, buyer, buyerName, seller, sellerName, quantity, pricePerItem, totalPrice, currency, platformFee, blockchainTxId, escrowAddress]
      );

      // Update item availability
      await client.query(
        `UPDATE marketplace_items 
         SET available_quantity = available_quantity - $2,
             status = CASE WHEN available_quantity - $2 <= 0 THEN 'SOLD' ELSE status END
         WHERE id = $1`,
        [itemId, quantity]
      );

      await client.query('COMMIT');
      return transactionResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMarketplaceTransaction(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT mt.*, mi.title as item_title, mi.image_url as item_image
       FROM marketplace_transactions mt
       JOIN marketplace_items mi ON mt.item_id = mi.id
       WHERE mt.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async getUserMarketplaceTransactions(userAddress: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT mt.*, mi.title as item_title, mi.image_url as item_image
       FROM marketplace_transactions mt
       JOIN marketplace_items mi ON mt.item_id = mi.id
       WHERE mt.buyer = $1 OR mt.seller = $1
       ORDER BY mt.created_at DESC`,
      [userAddress]
    );
    return result.rows;
  }

  async createMarketplaceBid(itemId: string, bidder: string, bidderName: string, bidAmount: number, currency: string, expiresAt?: Date): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO marketplace_bids (item_id, bidder, bidder_name, bid_amount, currency, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [itemId, bidder, bidderName, bidAmount, currency, expiresAt]
    );
    return result.rows[0];
  }

  async getMarketplaceBids(itemId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM marketplace_bids WHERE item_id = $1 AND status = 'ACTIVE' ORDER BY bid_amount DESC, created_at ASC`,
      [itemId]
    );
    return result.rows;
  }

  async getUserMarketplaceBids(userAddress: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT mb.*, mi.title as item_title, mi.image_url as item_image
       FROM marketplace_bids mb
       JOIN marketplace_items mi ON mb.item_id = mi.id
       WHERE mb.bidder = $1
       ORDER BY mb.created_at DESC`,
      [userAddress]
    );
    return result.rows;
  }

  async addToFavorites(userAddress: string, itemId: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO marketplace_favorites (user_address, item_id)
       VALUES ($1, $2)
       ON CONFLICT (user_address, item_id) DO NOTHING
       RETURNING *`,
      [userAddress, itemId]
    );
    return result.rows[0];
  }

  async removeFromFavorites(userAddress: string, itemId: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM marketplace_favorites WHERE user_address = $1 AND item_id = $2`,
      [userAddress, itemId]
    );
    return result.rowCount > 0;
  }

  async getUserFavorites(userAddress: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT mi.* FROM marketplace_items mi
       JOIN marketplace_favorites mf ON mi.id = mf.item_id
       WHERE mf.user_address = $1
       ORDER BY mf.created_at DESC`,
      [userAddress]
    );
    return result.rows;
  }

  async getMarketplaceStats(): Promise<any> {
    const result = await this.pool.query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_listings,
        COALESCE(AVG(price), 0) as average_price
      FROM marketplace_items
    `);

    const transactionStats = await this.pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_price), 0) as total_volume
      FROM marketplace_transactions 
      WHERE status = 'COMPLETED'
    `);

    return {
      ...result.rows[0],
      ...transactionStats.rows[0]
    };
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log('✅ Disconnected from PostgreSQL database');
  }
}