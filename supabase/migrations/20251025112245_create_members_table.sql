/*
  # Create Members Table for Vishwa Patrakar Mahasangh

  1. New Tables
    - `members`
      - `id` (uuid, primary key) - Unique identifier for each member
      - `full_name` (text) - Member's full name
      - `email` (text, unique) - Member's email address
      - `phone` (text) - Member's phone number
      - `organization` (text, optional) - Member's organization
      - `payment_status` (text) - Status: pending, completed, failed
      - `payment_session_id` (text, optional) - Payment session identifier
      - `registration_date` (timestamptz) - When member registered
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `members` table
    - Add policy for public to insert (registration)
    - Add policy for public to read completed registrations (member list)
    - Add policy for authenticated users to read all members

  3. Indexes
    - Index on email for faster lookups
    - Index on payment_status for filtering
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  organization text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_session_id text,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can register as a member"
  ON members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read completed registrations (for member list)
CREATE POLICY "Anyone can view completed members"
  ON members
  FOR SELECT
  TO anon, authenticated
  USING (payment_status = 'completed');

-- Allow authenticated users to read all members (for admin)
CREATE POLICY "Authenticated users can view all members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow updates to payment status (for webhook/edge function)
CREATE POLICY "Service role can update payment status"
  ON members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_payment_status ON members(payment_status);
CREATE INDEX IF NOT EXISTS idx_members_registration_date ON members(registration_date DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
