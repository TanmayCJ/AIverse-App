-- ================================================
-- FIX: Auto-create user profiles on registration
-- Run this in Supabase SQL Editor
-- ================================================

-- Drop existing policy that's too restrictive
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create a function to handle new user creation automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If profile already exists, just return
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table to auto-create profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create permissive insert policy (allows authenticated users to create their profile)
CREATE POLICY "Enable insert for authenticated users"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Also allow service role to insert (for the trigger)
CREATE POLICY "Enable insert for service role"
ON public.user_profiles FOR INSERT
TO service_role
WITH CHECK (true);
