/*
  # Create game scores table

  1. New Tables
    - `game_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `score` (integer, the score achieved)
      - `total_questions` (integer, total questions in the game)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `game_scores` table
    - Add policy for authenticated users to read their own scores
    - Add policy for authenticated users to insert their own scores
*/

CREATE TABLE IF NOT EXISTS game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own game scores"
  ON game_scores
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game scores"
  ON game_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS game_scores_user_id_idx ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS game_scores_created_at_idx ON game_scores(created_at DESC);
