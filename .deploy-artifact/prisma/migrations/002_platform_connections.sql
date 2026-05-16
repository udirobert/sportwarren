-- Persist real platform connection state instead of local-only UI flags

CREATE TABLE IF NOT EXISTS platform_connections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    platform TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    squad_id TEXT REFERENCES squads(id) ON DELETE CASCADE,
    username TEXT,
    chat_id TEXT,
    platform_user_id TEXT,
    group_address TEXT,
    link_token TEXT UNIQUE,
    linked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, squad_id)
);

CREATE INDEX IF NOT EXISTS idx_platform_connections_user ON platform_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_platform_status ON platform_connections(platform, status);
CREATE INDEX IF NOT EXISTS idx_platform_connections_chat ON platform_connections(platform, chat_id);
