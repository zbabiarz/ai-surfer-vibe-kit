/*
  # Add delete policy for app ideas

  1. Changes
    - Add policy to allow users to delete their own app ideas

  2. Security
    - Users can only delete their own app ideas
    - Requires authentication
*/

-- Create policy to allow users to delete their own app ideas
CREATE POLICY "Users can delete own app ideas"
  ON app_ideas
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);