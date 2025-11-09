-- ============================================
-- GRANT INSERT PERMISSIONS TO ANON ROLE
-- ============================================

-- RLS policies alone aren't enough - we also need to grant the anon role
-- permission to INSERT into these tables

-- Sessions (for analytics tracking)
GRANT INSERT, UPDATE ON sessions TO anon;

-- Lead captures (for lead magnet submissions)
GRANT INSERT ON lead_captures TO anon;

-- Events (for analytics tracking)
GRANT INSERT ON events TO anon;

-- Customers (for lead magnet customer records)
GRANT INSERT ON customers TO anon;

-- Also grant to authenticated role for consistency
GRANT INSERT, UPDATE ON sessions TO authenticated;
GRANT INSERT ON lead_captures TO authenticated;
GRANT INSERT ON events TO authenticated;
GRANT INSERT ON customers TO authenticated;
