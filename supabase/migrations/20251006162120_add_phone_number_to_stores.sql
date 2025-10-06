-- Add phone_number column to stores
ALTER TABLE stores 
ADD COLUMN phone_number TEXT;

-- Add index for phone lookups (optional)
CREATE INDEX idx_stores_phone_number ON stores(phone_number);

-- Add comment
COMMENT ON COLUMN stores.phone_number IS 'User phone number for contact';