-- ================================================
-- ATOMIC XP INCREMENT FUNCTION
-- ================================================
-- Function to safely increment XP without race conditions
-- Uses UPSERT pattern to handle new users

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

-- ================================================
-- ATOMIC STREAK UPDATE FUNCTION
-- ================================================
-- Safely updates streak data with atomic operations

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

-- ================================================
-- AWARD BADGE FUNCTION
-- ================================================
-- Safely awards badge and XP (prevents duplicates)

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
    
    -- Award XP atomically
    PERFORM increment_xp(p_xp_reward);
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
