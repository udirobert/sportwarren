-- SportWarren Database Schema
-- Core MVP: Match Verification → XP → Engagement

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE,
    wallet_address TEXT UNIQUE NOT NULL,
    chain TEXT NOT NULL,
    name TEXT,
    avatar TEXT,
    position TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player profiles
CREATE TABLE IF NOT EXISTS player_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    season_xp INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    total_goals INTEGER DEFAULT 0,
    total_assists INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player attributes (FIFA-style)
CREATE TABLE IF NOT EXISTS player_attributes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    profile_id TEXT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL,
    rating INTEGER DEFAULT 50,
    xp INTEGER DEFAULT 0,
    xp_to_next INTEGER DEFAULT 100,
    max_rating INTEGER DEFAULT 99,
    history INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, attribute)
);

-- Form entries (match ratings)
CREATE TABLE IF NOT EXISTS form_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    profile_id TEXT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    match_id TEXT NOT NULL,
    rating FLOAT NOT NULL,
    form_value INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Squads
CREATE TABLE IF NOT EXISTS squads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    founded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    home_ground TEXT,
    treasury_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Squad members
CREATE TABLE IF NOT EXISTS squad_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'player',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(squad_id, user_id)
);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    home_squad_id TEXT NOT NULL REFERENCES squads(id),
    away_squad_id TEXT NOT NULL REFERENCES squads(id),
    home_score INTEGER,
    away_score INTEGER,
    submitted_by TEXT NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tx_id TEXT
);

-- Match verifications
CREATE TABLE IF NOT EXISTS match_verifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    verifier_id TEXT NOT NULL REFERENCES users(id),
    verified BOOLEAN NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    trust_tier TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, verifier_id)
);

-- Player match stats
CREATE TABLE IF NOT EXISTS player_match_stats (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    profile_id TEXT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    clean_sheet BOOLEAN DEFAULT FALSE,
    rating FLOAT,
    minutes_played INTEGER DEFAULT 90,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, profile_id)
);

-- XP gains audit trail
CREATE TABLE IF NOT EXISTS xp_gains (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    match_id TEXT REFERENCES matches(id),
    profile_id TEXT NOT NULL,
    base_xp INTEGER NOT NULL,
    bonus_xp INTEGER DEFAULT 0,
    total_xp INTEGER NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    attribute_breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    type TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirement JSONB NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player achievements
CREATE TABLE IF NOT EXISTS player_achievements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    profile_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, achievement_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_home_squad ON matches(home_squad_id);
CREATE INDEX IF NOT EXISTS idx_matches_away_squad ON matches(away_squad_id);
CREATE INDEX IF NOT EXISTS idx_verifications_match ON match_verifications(match_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_squad ON squad_members(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_members_user ON squad_members(user_id);
CREATE INDEX IF NOT EXISTS idx_player_attributes_profile ON player_attributes(profile_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_profile ON form_entries(profile_id);
CREATE INDEX IF NOT EXISTS idx_xp_gains_profile ON xp_gains(profile_id);
