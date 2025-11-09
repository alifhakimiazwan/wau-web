-- Fix RLS policies for analytics tracking

-- ============================================================================
-- SESSIONS TABLE - Allow public to read sessions for analytics verification
-- ============================================================================

-- Drop and recreate policies to ensure they exist with correct permissions
DROP POLICY IF EXISTS "Public can view sessions" ON sessions;
CREATE POLICY "Public can view sessions"
  ON sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role can view all sessions" ON sessions;
CREATE POLICY "Service role can view all sessions"
  ON sessions
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================================================
-- LEAD_CAPTURES TABLE - Re-enable RLS with proper policies
-- ============================================================================

-- Re-enable RLS on lead_captures
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- Recreate public insert policy
DROP POLICY IF EXISTS "Public can insert leads" ON lead_captures;
CREATE POLICY "Public can insert leads"
  ON lead_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================================
-- CUSTOMERS TABLE - Re-enable RLS with proper policies  
-- ============================================================================

-- Re-enable RLS on customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Recreate public insert policy
DROP POLICY IF EXISTS "Public can insert customers" ON customers;
CREATE POLICY "Public can insert customers"
  ON customers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
