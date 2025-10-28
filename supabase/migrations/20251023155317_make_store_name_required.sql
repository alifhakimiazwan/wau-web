-- Make store name required (NOT NULL)
-- Since onboarding requires name, this should always be set

-- First, update any existing stores with NULL name (shouldn't exist, but just in case)
UPDATE stores
SET name = slug
WHERE name IS NULL;

-- Now add NOT NULL constraint
ALTER TABLE stores
ALTER COLUMN name SET NOT NULL;
