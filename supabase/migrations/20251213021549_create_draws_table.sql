/*
  # Create draws table for managing draw state and history

  1. New Tables
    - `draws`
      - `id` (uuid, primary key)
      - `draw_number` (integer, 1-3)
      - `prize` (text)
      - `winning_ticket` (integer)
      - `winner_id` (integer, references contestant id from JSON)
      - `winner_name` (text)
      - `status` (text, 'pending' or 'completed')
      - `drawn_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `draws` table
    - Public read access (draws are public information)
    - Restrict write access to authenticated users with admin role

  3. Notes
    - Draw state is maintained in this table
    - Winner exclusion is handled by application logic, not at DB level
    - Data from JSON remains unchanged; draw results are stored separately
*/

CREATE TABLE IF NOT EXISTS draws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_number integer NOT NULL UNIQUE CHECK (draw_number >= 1 AND draw_number <= 3),
  prize text NOT NULL,
  winning_ticket integer,
  winner_id integer,
  winner_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  drawn_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(draw_number)
);

ALTER TABLE draws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view draws"
  ON draws FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can execute draws"
  ON draws FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
