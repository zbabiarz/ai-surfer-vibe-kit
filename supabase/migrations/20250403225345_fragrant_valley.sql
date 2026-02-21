/*
  # Create app ideas table and policies

  1. New Tables
    - `app_ideas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `purpose` (text)
      - `target_audience` (text)
      - `main_features` (text)
      - `design_notes` (text)
      - `technical_stack` (text)
      - `monetization` (text)
      - `timeline` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `app_ideas` table
    - Add policies for authenticated users to:
      - Create their own app ideas
      - Read their own app ideas
      - Update their own app ideas
*/

-- Create the app_ideas table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE app_ideas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can create app ideas" ON app_ideas;
  DROP POLICY IF EXISTS "Users can read own app ideas" ON app_ideas;
  DROP POLICY IF EXISTS "Users can update own app ideas" ON app_ideas;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Users can create app ideas"
  ON app_ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own app ideas"
  ON app_ideas
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own app ideas"
  ON app_ideas
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_app_ideas_updated_at ON app_ideas;

-- Create trigger
CREATE TRIGGER update_app_ideas_updated_at
  BEFORE UPDATE ON app_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();