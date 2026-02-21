/*
  # Add sketches table

  1. New Tables
    - `sketches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `data` (text, stores canvas data)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `sketches` table
    - Add policies for authenticated users to:
      - Create their own sketches
      - Read their own sketches
      - Update their own sketches
      - Delete their own sketches
*/

CREATE TABLE sketches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  data text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sketches ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to create their own sketches
CREATE POLICY "Users can create sketches"
  ON sketches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to read their own sketches
CREATE POLICY "Users can read own sketches"
  ON sketches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own sketches
CREATE POLICY "Users can update own sketches"
  ON sketches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own sketches
CREATE POLICY "Users can delete own sketches"
  ON sketches
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_sketches_updated_at
  BEFORE UPDATE ON sketches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();