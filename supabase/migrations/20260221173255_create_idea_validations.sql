/*
  # Create idea_validations table

  1. New Tables
    - `idea_validations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users, NOT NULL) — the user who ran the analysis
      - `app_idea_id` (uuid, FK to app_ideas, NOT NULL) — the idea this analysis belongs to
      - `result` (jsonb, NOT NULL) — the full ValidationResult JSON object
      - `created_at` (timestamptz, default now())

  2. Constraints
    - UNIQUE on `app_idea_id` so each saved idea has at most one stored analysis (upserted on re-run)

  3. Security
    - Enable RLS on `idea_validations`
    - SELECT: authenticated user can read their own rows
    - INSERT: authenticated user can insert rows for themselves
    - UPDATE: authenticated user can update their own rows (for upsert re-runs)
    - DELETE: authenticated user can delete their own rows

  4. Notes
    - Daily rate limiting is enforced client-side by counting rows where
      user_id = auth.uid() AND created_at >= CURRENT_DATE
    - The UNIQUE constraint on app_idea_id enables ON CONFLICT DO UPDATE (upsert)
      so re-running a validation overwrites the previous result cleanly
*/

CREATE TABLE IF NOT EXISTS idea_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_idea_id uuid NOT NULL REFERENCES app_ideas(id) ON DELETE CASCADE,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT idea_validations_app_idea_id_key UNIQUE (app_idea_id)
);

ALTER TABLE idea_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own validations"
  ON idea_validations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own validations"
  ON idea_validations
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own validations"
  ON idea_validations
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own validations"
  ON idea_validations
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idea_validations_user_id_idx ON idea_validations (user_id);
CREATE INDEX IF NOT EXISTS idea_validations_app_idea_id_idx ON idea_validations (app_idea_id);
CREATE INDEX IF NOT EXISTS idea_validations_user_date_idx ON idea_validations (user_id, created_at);
