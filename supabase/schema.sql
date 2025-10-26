-- ================================================
-- SUPABASE DATABASE SCHEMA FOR AIVERSE
-- Complete migration from Django + Neon to Supabase
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. USER PROFILES TABLE
-- ================================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    avatar_url TEXT,
    
    -- Points tracking
    total_points INTEGER DEFAULT 0,
    sustainability_points INTEGER DEFAULT 0,
    github_points INTEGER DEFAULT 0,
    leetcode_points INTEGER DEFAULT 0,
    
    -- GitHub integration
    github_username TEXT,
    github_repo_count INTEGER DEFAULT 0,
    
    -- LeetCode integration
    leetcode_username TEXT,
    leetcode_solved INTEGER DEFAULT 0,
    
    -- Gamification
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for leaderboard queries
CREATE INDEX idx_user_profiles_total_points ON public.user_profiles(total_points DESC);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);

-- ================================================
-- 2. GITHUB REPOSITORIES TABLE
-- ================================================
CREATE TABLE public.github_repositories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    repo_name TEXT NOT NULL,
    repo_url TEXT,
    description TEXT,
    stars INTEGER DEFAULT 0,
    language TEXT,
    points_awarded INTEGER DEFAULT 10,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_github_repos_user_id ON public.github_repositories(user_id);

-- ================================================
-- 3. LEETCODE SUBMISSIONS TABLE
-- ================================================
CREATE TABLE public.leetcode_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    problem_name TEXT NOT NULL,
    problem_difficulty TEXT CHECK (problem_difficulty IN ('easy', 'medium', 'hard')),
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER NOT NULL, -- +10 for correct, -5 for wrong
    
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leetcode_submissions_user_id ON public.leetcode_submissions(user_id);
CREATE INDEX idx_leetcode_submissions_date ON public.leetcode_submissions(submission_date DESC);

-- ================================================
-- 4. SUSTAINABILITY ACTIONS TABLE
-- ================================================
CREATE TABLE public.sustainability_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    action_type TEXT NOT NULL,
    description TEXT,
    impact_level TEXT CHECK (impact_level IN ('low', 'medium', 'high')),
    points INTEGER DEFAULT 0,
    
    action_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sustainability_actions_user_id ON public.sustainability_actions(user_id);
CREATE INDEX idx_sustainability_actions_date ON public.sustainability_actions(action_date DESC);

-- ================================================
-- 5. CHALLENGES TABLE (Optional for future)
-- ================================================
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    title TEXT NOT NULL,
    description TEXT,
    challenge_type TEXT,
    points_reward INTEGER DEFAULT 0,
    
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. CHALLENGE PARTICIPATIONS TABLE
-- ================================================
CREATE TABLE public.challenge_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    
    completed BOOLEAN DEFAULT false,
    completion_date TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, challenge_id)
);

-- ================================================
-- 7. FUNCTIONS FOR AUTO-UPDATING
-- ================================================

-- Function to update user profile points
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        total_points = (
            COALESCE(sustainability_points, 0) + 
            COALESCE(github_points, 0) + 
            COALESCE(leetcode_points, 0)
        ),
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate GitHub points
CREATE OR REPLACE FUNCTION calculate_github_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_repos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_repos
    FROM public.github_repositories
    WHERE user_id = p_user_id;
    
    RETURN total_repos * 10; -- 10 points per repo
END;
$$ LANGUAGE plpgsql;

-- Function to calculate LeetCode points
CREATE OR REPLACE FUNCTION calculate_leetcode_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_points INTEGER;
BEGIN
    SELECT COALESCE(SUM(points_earned), 0) INTO total_points
    FROM public.leetcode_submissions
    WHERE user_id = p_user_id;
    
    RETURN total_points;
END;
$$ LANGUAGE plpgsql;

-- Function to update all points for a user
CREATE OR REPLACE FUNCTION refresh_user_points(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.user_profiles
    SET 
        github_points = calculate_github_points(p_user_id),
        leetcode_points = calculate_leetcode_points(p_user_id),
        github_repo_count = (SELECT COUNT(*) FROM public.github_repositories WHERE user_id = p_user_id),
        leetcode_solved = (SELECT COUNT(*) FROM public.leetcode_submissions WHERE user_id = p_user_id AND is_correct = true),
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Update total points
    UPDATE public.user_profiles
    SET total_points = COALESCE(sustainability_points, 0) + COALESCE(github_points, 0) + COALESCE(leetcode_points, 0)
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. TRIGGERS
-- ================================================

-- Trigger to update points when GitHub repo is added (INSERT only)
CREATE TRIGGER trigger_github_repo_insert
AFTER INSERT ON public.github_repositories
FOR EACH ROW
EXECUTE FUNCTION refresh_user_points(NEW.user_id);

-- Trigger to update points when GitHub repo is deleted
CREATE TRIGGER trigger_github_repo_delete
AFTER DELETE ON public.github_repositories
FOR EACH ROW
EXECUTE FUNCTION refresh_user_points(OLD.user_id);

-- Trigger to update points when LeetCode submission is added
CREATE TRIGGER trigger_leetcode_submission_update
AFTER INSERT ON public.leetcode_submissions
FOR EACH ROW
EXECUTE FUNCTION refresh_user_points(NEW.user_id);

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainability_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

-- ===== USER PROFILES POLICIES =====

-- Anyone can view all profiles (for leaderboard)
CREATE POLICY "Public profiles are viewable by everyone"
ON public.user_profiles FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- ===== GITHUB REPOSITORIES POLICIES =====

-- Anyone can view repositories (for leaderboard details)
CREATE POLICY "GitHub repos are viewable by everyone"
ON public.github_repositories FOR SELECT
USING (true);

-- Users can insert their own repositories
CREATE POLICY "Users can insert own github repos"
ON public.github_repositories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own repositories
CREATE POLICY "Users can delete own github repos"
ON public.github_repositories FOR DELETE
USING (auth.uid() = user_id);

-- ===== LEETCODE SUBMISSIONS POLICIES =====

-- Users can view their own submissions
CREATE POLICY "Users can view own leetcode submissions"
ON public.leetcode_submissions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can insert own leetcode submissions"
ON public.leetcode_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== SUSTAINABILITY ACTIONS POLICIES =====

-- Users can view their own actions
CREATE POLICY "Users can view own sustainability actions"
ON public.sustainability_actions FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own actions
CREATE POLICY "Users can insert own sustainability actions"
ON public.sustainability_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ===== CHALLENGES POLICIES =====

-- Everyone can view active challenges
CREATE POLICY "Anyone can view challenges"
ON public.challenges FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

-- ===== CHALLENGE PARTICIPATIONS POLICIES =====

-- Users can view their own participations
CREATE POLICY "Users can view own participations"
ON public.challenge_participations FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own participations
CREATE POLICY "Users can insert own participations"
ON public.challenge_participations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- 10. INITIAL DATA / SEED DATA
-- ================================================

-- You can add seed data here if needed
-- Example: INSERT INTO challenges (title, description, ...) VALUES (...);

-- ================================================
-- MIGRATION COMPLETE
-- ================================================

-- To verify the schema, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
