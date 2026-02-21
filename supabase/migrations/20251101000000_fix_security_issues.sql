/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add indexes for foreign key columns on `app_ideas` and `sketches` tables
    - Optimize RLS policies to use subqueries for auth functions
    - Remove unused index on `game_scores`

  2. Tables Modified
    - `app_ideas`: Add index on `user_id`, update RLS policies
    - `sketches`: Add index on `user_id`, update RLS policies
    - `users`: Update RLS policies
    - `game_scores`: Update RLS policies, remove unused index

  3. Security
    - All RLS policies optimized to prevent re-evaluation on each row
    - Function search path issues resolved

  Note: This migration improves query performance at scale by using subqueries
  for auth functions in RLS policies as recommended by Supabase documentation.
*/

-- Add indexes for foreign keys
CREATE INDEX IF NOT EXISTS app_ideas_user_id_idx ON app_ideas(user_id);
CREATE INDEX IF NOT EXISTS sketches_user_id_idx ON sketches(user_id);

-- Remove unused index on game_scores
DROP INDEX IF EXISTS game_scores_created_at_idx;

-- Update RLS policies for app_ideas table
DROP POLICY IF EXISTS "Users can create app ideas" ON app_ideas;
DROP POLICY IF EXISTS "Users can read own app ideas" ON app_ideas;
DROP POLICY IF EXISTS "Users can update own app ideas" ON app_ideas;
DROP POLICY IF EXISTS "Users can delete own app ideas" ON app_ideas;

CREATE POLICY "Users can create app ideas"
  ON app_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can read own app ideas"
  ON app_ideas
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own app ideas"
  ON app_ideas
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own app ideas"
  ON app_ideas
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Update RLS policies for sketches table
DROP POLICY IF EXISTS "Users can create sketches" ON sketches;
DROP POLICY IF EXISTS "Users can read own sketches" ON sketches;
DROP POLICY IF EXISTS "Users can update own sketches" ON sketches;
DROP POLICY IF EXISTS "Users can delete own sketches" ON sketches;

CREATE POLICY "Users can create sketches"
  ON sketches
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can read own sketches"
  ON sketches
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own sketches"
  ON sketches
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own sketches"
  ON sketches
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Update RLS policies for game_scores table
DROP POLICY IF EXISTS "Users can read own game scores" ON game_scores;
DROP POLICY IF EXISTS "Users can insert own game scores" ON game_scores;

CREATE POLICY "Users can read own game scores"
  ON game_scores
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own game scores"
  ON game_scores
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Fix function search path for update_updated_at_column
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for the function
CREATE TRIGGER update_app_ideas_updated_at
  BEFORE UPDATE ON app_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sketches_updated_at
  BEFORE UPDATE ON sketches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
