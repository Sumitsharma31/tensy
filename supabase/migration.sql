-- ================================================
-- COMPLETE MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor
-- ================================================

-- Step 1: Add missing columns to existing tables
-- ================================================

-- Add streak columns to user_progress if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='current_streak') THEN
        ALTER TABLE user_progress ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='longest_streak') THEN
        ALTER TABLE user_progress ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_progress' AND column_name='last_activity_date') THEN
        ALTER TABLE user_progress ADD COLUMN last_activity_date DATE;
    END IF;
END $$;

-- Add tenses_completed and weekly_completed to user_challenges if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_challenges' AND column_name='tenses_completed') THEN
        ALTER TABLE user_challenges ADD COLUMN tenses_completed TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='user_challenges' AND column_name='weekly_completed') THEN
        ALTER TABLE user_challenges ADD COLUMN weekly_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add voice settings columns to users table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='voice_preference') THEN
        ALTER TABLE users ADD COLUMN voice_preference VARCHAR(100) DEFAULT 'en-US-Standard-A';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='voice_speed') THEN
        ALTER TABLE users ADD COLUMN voice_speed DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_speed >= 0.25 AND voice_speed <= 4.0);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='voice_pitch') THEN
        ALTER TABLE users ADD COLUMN voice_pitch DECIMAL(3,2) DEFAULT 1.0 CHECK (voice_pitch >= 0.5 AND voice_pitch <= 2.0);
    END IF;
END $$;

-- Step 2: Drop and recreate RLS policies
-- ================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can view all progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can manage own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can select own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON user_streaks;

DROP POLICY IF EXISTS "Users can manage own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can select own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can insert own challenges" ON user_challenges;
DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;

DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
DROP POLICY IF EXISTS "System can award badges" ON user_badges;
DROP POLICY IF EXISTS "Users can view all badges" ON user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can update own badges" ON user_badges;

-- Create new Supabase Auth policies
-- Users table
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (id = auth.uid());

-- User progress
CREATE POLICY "Users can view all progress" ON user_progress
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (user_id = auth.uid());

-- User streaks (legacy table)
CREATE POLICY "Users can select own streaks" ON user_streaks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own streaks" ON user_streaks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own streaks" ON user_streaks
    FOR UPDATE USING (user_id = auth.uid());

-- User challenges
CREATE POLICY "Users can select own challenges" ON user_challenges
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own challenges" ON user_challenges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challenges" ON user_challenges
    FOR UPDATE USING (user_id = auth.uid());

-- User badges
CREATE POLICY "Users can view all badges" ON user_badges
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own badges" ON user_badges
    FOR UPDATE USING (user_id = auth.uid());

-- Step 3: Create PostgreSQL functions
-- ================================================

-- Atomic XP increment function
CREATE OR REPLACE FUNCTION increment_xp(amount INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO user_progress (user_id, total_xp, updated_at)
  VALUES (auth.uid(), amount, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    total_xp = user_progress.total_xp + amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic streak update function
CREATE OR REPLACE FUNCTION update_streak(
  new_current_streak INTEGER,
  new_longest_streak INTEGER,
  new_last_activity_date DATE
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_progress (
    user_id, 
    current_streak,
    longest_streak,
    last_activity_date,
    updated_at
  )
  VALUES (
    auth.uid(),
    new_current_streak,
    new_longest_streak,
    new_last_activity_date,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET 
    current_streak = new_current_streak,
    longest_streak = GREATEST(user_progress.longest_streak, new_longest_streak),
    last_activity_date = new_last_activity_date,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award badge function (prevents duplicates)
CREATE OR REPLACE FUNCTION award_badge(
  p_badge_id VARCHAR(50),
  p_badge_name VARCHAR(100),
  p_xp_reward INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  badge_exists BOOLEAN;
BEGIN
  -- Check if badge already exists
  SELECT EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_id = auth.uid() AND badge_id = p_badge_id
  ) INTO badge_exists;
  
  -- If badge doesn't exist, award it
  IF NOT badge_exists THEN
    -- Insert badge
    INSERT INTO user_badges (user_id, badge_id, badge_name, earned_at)
    VALUES (auth.uid(), p_badge_id, p_badge_name, NOW());
    
    -- Award XP atomically (only if XP reward > 0)
    IF p_xp_reward > 0 THEN
      PERFORM increment_xp(p_xp_reward);
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
-- Next steps:
-- 1. Verify all tables have the new columns
-- 2. Test RLS policies with authenticated users
-- 3. Test the frontend hooks
