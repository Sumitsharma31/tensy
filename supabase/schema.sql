-- Tense Playground Database Schema
-- PostgreSQL / Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE
-- ================================================
-- Stores user account information synced from Clerk
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  avatar_url TEXT,
  voice_preference VARCHAR(100) DEFAULT 'en-US-Standard-A',
  voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed >= 0.25 AND voice_speed <= 4.0),
  voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch >= 0.5 AND voice_pitch <= 2.0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ================================================
-- USER PROGRESS TABLE
-- ================================================
-- Tracks overall learning progress, XP, and streaks
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_completed INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_xp ON user_progress(total_xp DESC);

-- ================================================
-- USER STREAKS TABLE
-- ================================================
-- Tracks daily practice streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  activity_dates JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_last_activity ON user_streaks(last_activity_date DESC);

-- ================================================
-- USER CHALLENGES TABLE
-- ================================================
-- Tracks daily and weekly challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE DEFAULT CURRENT_DATE,
  quiz_questions_completed INTEGER DEFAULT 0,
  sentences_built INTEGER DEFAULT 0,
  rainfall_score INTEGER DEFAULT 0,
  daily_completed BOOLEAN DEFAULT FALSE,
  weekly_streak_days INTEGER DEFAULT 0,
  tenses_completed TEXT[] DEFAULT '{}',
  tenses_mastered INTEGER DEFAULT 0,
  perfect_score_achieved BOOLEAN DEFAULT FALSE,
  weekly_completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, challenge_date)
);

CREATE INDEX IF NOT EXISTS idx_challenges_user_date ON user_challenges(user_id, challenge_date DESC);

-- ================================================
-- USER BADGES TABLE
-- ================================================
-- Stores achievement badges earned by users
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON user_badges(user_id);

-- ================================================
-- LEADERBOARD VIEW
-- ================================================
-- Materialized view for efficient leaderboard queries
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.avatar_url,
  up.total_xp,
  up.level,
  us.current_streak,
  us.longest_streak,
  COUNT(ub.id) as badges_earned,
  up.updated_at
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_streaks us ON u.id = us.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id, u.username, u.email, u.avatar_url, up.total_xp, up.level, us.current_streak, us.longest_streak, up.updated_at
ORDER BY up.total_xp DESC;

-- Index on the materialized view
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(total_xp DESC);

-- Refresh the materialized view (run periodically)
-- REFRESH MATERIALIZED VIEW leaderboard;

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON user_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
-- Enable RLS on all tables for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can manage own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can manage own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "System can award badges" ON user_badges;

-- ================================================
-- SUPABASE AUTH RLS POLICIES
-- ================================================
-- Using auth.uid() for Supabase Authentication

-- Users table policies
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true); -- Public read for leaderboard

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- User progress policies
CREATE POLICY "Users can view all progress" ON user_progress
    FOR SELECT USING (true); -- Public read for leaderboard

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (user_id = auth.uid());

-- User streaks policies (DEPRECATED - now in user_progress)
CREATE POLICY "Users can select own streaks" ON user_streaks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streaks" ON user_streaks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks" ON user_streaks
    FOR UPDATE USING (user_id = auth.uid());

-- User challenges policies
CREATE POLICY "Users can select own challenges" ON user_challenges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own challenges" ON user_challenges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR UPDATE USING (user_id = auth.uid());

-- User badges policies
CREATE POLICY "Users can view all badges" ON user_badges
    FOR SELECT USING (true); -- Public read for achievements

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own badges" ON user_badges
    FOR UPDATE USING (user_id = auth.uid());

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================
/*
-- Insert sample user
INSERT INTO users (clerk_id, email, username) VALUES 
('user_test123', 'test@example.com', 'testuser');

-- Get the user_id
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM users WHERE clerk_id = 'user_test123';
    
    -- Insert sample progress
    INSERT INTO user_progress (user_id, total_xp, level) VALUES 
    (test_user_id, 500, 5);
    
    -- Insert sample streak
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_days) VALUES 
    (test_user_id, 7, 14, 25);
    
    -- Insert sample badges
    INSERT INTO user_badges (user_id, badge_id, badge_name) VALUES 
    (test_user_id, 'first_steps', 'First Steps'),
    (test_user_id, 'quick_learner', 'Quick Learner');
END $$;
*/

-- ================================================
-- NOTES
-- ================================================
-- 1. Run this script in your Supabase SQL editor
-- 2. Update RLS policies based on your Clerk integration
-- 3. Set up a cron job to refresh the materialized view:
--    SELECT cron.schedule('refresh-leaderboard', '0 * * * *', 'REFRESH MATERIALIZED VIEW leaderboard;');
-- 4. Adjust column types/constraints as needed
-- 5. Add more indexes if query performance requires
