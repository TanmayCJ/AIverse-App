-- AIverse Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sustainability Actions Table
CREATE TABLE sustainability_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('transport', 'energy', 'waste', 'water', 'food', 'other')),
  points INTEGER NOT NULL CHECK (points >= 1 AND points <= 100),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action, date)
);

-- 3. Challenges Table
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
  points INTEGER NOT NULL,
  target_count INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Challenge Participants Table
CREATE TABLE challenge_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_actions_user_id ON sustainability_actions(user_id);
CREATE INDEX idx_actions_date ON sustainability_actions(date);
CREATE INDEX idx_actions_created_at ON sustainability_actions(created_at DESC);
CREATE INDEX idx_profiles_total_points ON profiles(total_points DESC);
CREATE INDEX idx_challenges_active ON challenges(is_active, start_date, end_date);
CREATE INDEX idx_participants_user_id ON challenge_participants(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON sustainability_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user profile points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    total_points = (
      SELECT COALESCE(SUM(points), 0)
      FROM sustainability_actions
      WHERE user_id = NEW.user_id
    ),
    level = FLOOR((
      SELECT COALESCE(SUM(points), 0)
      FROM sustainability_actions
      WHERE user_id = NEW.user_id
    ) / 100) + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update points when action is added/updated/deleted
CREATE TRIGGER update_points_on_action_insert
  AFTER INSERT ON sustainability_actions
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

CREATE TRIGGER update_points_on_action_update
  AFTER UPDATE ON sustainability_actions
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

CREATE TRIGGER update_points_on_action_delete
  AFTER DELETE ON sustainability_actions
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) as new_rank
    FROM profiles
  )
  UPDATE profiles p
  SET rank = r.new_rank
  FROM ranked_users r
  WHERE p.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Create a view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.total_points,
  p.level,
  p.rank,
  COUNT(sa.id) as total_actions
FROM profiles p
LEFT JOIN sustainability_actions sa ON p.id = sa.user_id
GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.total_points, p.level, p.rank
ORDER BY p.total_points DESC, p.created_at ASC;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Sustainability Actions: Users can only manage their own actions
CREATE POLICY "Users can view all actions"
  ON sustainability_actions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own actions"
  ON sustainability_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own actions"
  ON sustainability_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own actions"
  ON sustainability_actions FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges: Everyone can view, only admins can create/update/delete
CREATE POLICY "Challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (true);

-- Challenge Participants: Users can manage their own participation
CREATE POLICY "Users can view all participants"
  ON challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Sample data (optional - for testing)
-- You can uncomment these to add sample challenges

-- INSERT INTO challenges (title, description, challenge_type, points, target_count, start_date, end_date, is_active) VALUES
-- ('Zero Waste Week', 'Complete 7 waste reduction actions in one week', 'weekly', 50, 7, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
-- ('Sustainable Commute', 'Use public transport or bike to work for 5 days', 'weekly', 30, 5, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
-- ('Daily Energy Saver', 'Save energy by unplugging devices when not in use', 'daily', 10, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', true);
