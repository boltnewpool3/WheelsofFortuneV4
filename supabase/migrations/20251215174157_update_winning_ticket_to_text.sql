/*
  # Update winning_ticket column to text

  1. Changes
    - Alter `winning_ticket` column from integer to text
    - This change is needed because ticket IDs are strings like "6Q69", not numbers

  2. Notes
    - Existing data will be converted automatically
    - This migration is idempotent and safe to run multiple times
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'draws'
    AND column_name = 'winning_ticket'
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE draws ALTER COLUMN winning_ticket TYPE text USING winning_ticket::text;
  END IF;
END $$;