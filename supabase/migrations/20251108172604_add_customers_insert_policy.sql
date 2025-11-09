-- ============================================
-- CUSTOMERS TABLE RLS POLICY FOR LEAD MAGNETS
-- ============================================

-- Allow public to insert/upsert customers (from lead magnet submissions)
-- This is needed for lead capture to automatically create customer records
CREATE POLICY "Public can insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Note: This allows anyone to create customer records, but they can only
-- be associated with valid stores (due to foreign key constraints).
-- Store owners can view and update their own customers via existing policies.
