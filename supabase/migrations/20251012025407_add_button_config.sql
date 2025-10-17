-- Add button configuration columns to store_customization table
ALTER TABLE store_customization
ADD COLUMN IF NOT EXISTS button_shape TEXT DEFAULT 'rounded' CHECK (button_shape IN ('square', 'rounded', 'pill')),
ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'filled' CHECK (button_style IN ('filled', 'outlined', 'ghost')),
ADD COLUMN IF NOT EXISTS button_color TEXT,
ADD COLUMN IF NOT EXISTS button_hover_effect TEXT DEFAULT 'scale' CHECK (button_hover_effect IN ('none', 'scale', 'lift', 'glow'));

-- Add comment
COMMENT ON COLUMN store_customization.button_shape IS 'Global button shape for all link buttons';
COMMENT ON COLUMN store_customization.button_style IS 'Global button style (filled, outlined, ghost)';
COMMENT ON COLUMN store_customization.button_color IS 'Custom button color (hex). NULL means use theme accent color';
COMMENT ON COLUMN store_customization.button_hover_effect IS 'Hover animation effect for buttons';