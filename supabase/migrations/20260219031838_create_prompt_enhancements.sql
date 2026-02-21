/*
  # Create prompt_enhancements table

  1. New Tables
    - `prompt_enhancements`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz, defaults to now())

  2. Security
    - Enable RLS on `prompt_enhancements` table
    - Add policy for authenticated users to insert their own rows
    - Add policy for authenticated users to select their own rows

  3. Notes
    - This table tracks how many prompt enhancements a user performs per day
    - No prompt content is stored; only the timestamp and user reference
*/

CREATE TABLE IF NOT EXISTS prompt_enhancements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prompt_enhancements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own enhancement records"
  ON prompt_enhancements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own enhancement records"
  ON prompt_enhancements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prompt_enhancements_user_created
  ON prompt_enhancements (user_id, created_at);
