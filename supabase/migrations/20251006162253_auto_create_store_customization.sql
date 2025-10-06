-- Function to auto-create store customization
CREATE OR REPLACE FUNCTION create_store_customization()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default customization for new store
  INSERT INTO store_customization (store_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger after store insert
CREATE TRIGGER trigger_create_store_customization
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION create_store_customization();

-- Add comment
COMMENT ON FUNCTION create_store_customization() IS 
  'Automatically creates default store customization when a new store is created';