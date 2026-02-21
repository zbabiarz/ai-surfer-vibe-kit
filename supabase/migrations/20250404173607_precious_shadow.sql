/*
  # Remove technical stack and timeline fields

  1. Changes
    - Remove `technical_stack` column from `app_ideas` table
    - Remove `timeline` column from `app_ideas` table

  Note: Using safe column removal to preserve existing data
*/

DO $$ 
BEGIN
  -- Remove technical_stack column if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_ideas' AND column_name = 'technical_stack'
  ) THEN
    ALTER TABLE app_ideas DROP COLUMN technical_stack;
  END IF;

  -- Remove timeline column if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_ideas' AND column_name = 'timeline'
  ) THEN
    ALTER TABLE app_ideas DROP COLUMN timeline;
  END IF;
END $$;