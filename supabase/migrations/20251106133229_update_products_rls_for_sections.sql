-- ============================================
-- UPDATE PRODUCTS RLS POLICY FOR SECTIONS
-- Created: 2025-11-06
-- Description: Allow public to view sections in addition to published products
-- ============================================

-- Drop the old policy
DROP POLICY IF EXISTS "Public can view published products" ON products;

-- Create new policy that includes sections
-- Sections (item_type='section') are always visible
-- Products (item_type='product') must be published
CREATE POLICY "Public can view published products and sections"
  ON products FOR SELECT
  USING (
    item_type = 'section' OR
    (item_type = 'product' AND status = 'published')
  );
