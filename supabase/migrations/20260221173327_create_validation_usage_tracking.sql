/*
  # Create validation usage tracking table

  1. New Tables
    - `validation_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users, NOT NULL)
      - `created_at` (timestamptz, default now())

  2. Purpose
    - Tracks every validation API call attempt (one row per attempt)
    - Used to enforce the 3-per-day rate limit per user
    - Separate from idea_validations so that re-running an idea still
      counts against the daily quota even though idea_validations upserts
    - Rows are NEVER deleted (to prevent gaming the limit)

  3. Security
    - Enable RLS on `validation_usage`
    - SELECT: user can read their own rows (to check their daily count)
    - INSERT: user can insert rows for themselves (to log an attempt)
    - No UPDATE or DELETE policies (rows are immutable once written)

  4. Index
    - Index on (user_id, created_at) for fast daily count queries
*/

CREATE TABLE IF NOT EXISTS validation_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE validation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON validation_usage
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own usage"
  ON validation_usage
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS validation_usage_user_date_idx ON validation_usage (user_id, created_at);
