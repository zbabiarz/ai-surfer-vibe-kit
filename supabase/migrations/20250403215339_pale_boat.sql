/*
  # Create app ideas table

  1. New Tables
    - `app_ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `purpose` (text)
      - `target_audience` (text)
      - `main_features` (text)
      - `design_notes` (text)
      - `technical_stack` (text)
      - `monetization` (text)
      - `timeline` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_ideas` table
    - Add policies for authenticated users to:
      - Read their own app ideas
      - Create new app ideas
      - Update their own app ideas
*/

CREATE TABLE app_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text,
  purpose text,
  target_audience text,
  main_features text,
  design_notes text,
  technical_stack text,
  monetization text,
  timeline text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_ideas ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own app ideas
CREATE POLICY "Users can read own app ideas"
  ON app_ideas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to insert their own app ideas
CREATE POLICY "Users can create app ideas"
  ON app_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own app ideas
CREATE POLICY "Users can update own app ideas"
  ON app_ideas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update the updated_at column
CREATE TRIGGER update_app_ideas_updated_at
  BEFORE UPDATE
  ON app_ideas
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();