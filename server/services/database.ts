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

        CREATE INDEX IF NOT EXISTS idx_squad_members_user_id ON squad_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_squad_members_squad_id ON squad_members(squad_id);
        CREATE INDEX IF NOT EXISTS idx_matches_squad_id ON matches(squad_id);
        CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON match_events(match_id);
        CREATE INDEX IF NOT EXISTS idx_player_stats_user_id ON player_stats(user_id);
        CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
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

  async disconnect(): Promise<void> {
    await this.pool.end();
    console.log('✅ Disconnected from PostgreSQL database');
  }
}