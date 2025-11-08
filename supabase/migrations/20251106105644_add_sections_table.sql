-- ============================================
-- ADD ITEM_TYPE TO PRODUCTS TABLE
-- Created: 2025-11-06
-- Description: Add item_type to support sections in product list
-- ============================================

-- Add item_type column to products table
-- 'product' = regular product, 'section' = organizational header
ALTER TABLE products
  ADD COLUMN item_type TEXT DEFAULT 'product'
  CHECK (item_type IN ('product', 'section'));

-- For section items, type and status fields are not required
-- Update existing rows to have item_type = 'product'
UPDATE products SET item_type = 'product' WHERE item_type IS NULL;

-- Make item_type NOT NULL after setting defaults
ALTER TABLE products ALTER COLUMN item_type SET NOT NULL;

-- Make type column nullable (sections don't have a product type)
ALTER TABLE products ALTER COLUMN type DROP NOT NULL;

-- Add index for item_type
CREATE INDEX idx_products_item_type ON products(item_type);
