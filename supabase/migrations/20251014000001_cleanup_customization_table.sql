-- Drop the old constraint first
ALTER TABLE store_customization
DROP CONSTRAINT IF EXISTS store_customization_block_shape_check;

-- Update existing 'round' values to 'rounded'
UPDATE store_customization
SET block_shape = 'rounded'
WHERE block_shape = 'round';

-- Add the new constraint with updated values
ALTER TABLE store_customization
ADD CONSTRAINT store_customization_block_shape_check
CHECK (block_shape IN ('square', 'rounded', 'pill'));

-- Set default for block_shape to 'rounded'
ALTER TABLE store_customization
ALTER COLUMN block_shape SET DEFAULT 'rounded';

-- Rename secondary_color to accent_color
ALTER TABLE store_customization
RENAME COLUMN secondary_color TO accent_color;

-- Drop unnecessary columns
ALTER TABLE store_customization
DROP COLUMN IF EXISTS background_color,
DROP COLUMN IF EXISTS text_color,
DROP COLUMN IF EXISTS show_animations,
DROP COLUMN IF EXISTS show_shadows,
DROP COLUMN IF EXISTS button_shape,
DROP COLUMN IF EXISTS button_color,
DROP COLUMN IF EXISTS button_hover_effect;

-- Add button_style column if it doesn't exist
ALTER TABLE store_customization
ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'filled'
CHECK (button_style IN ('filled', 'outlined', 'ghost'));
