-- ============================================
-- INITIAL SCHEMA FOR CREATOR PLATFORM MVP
-- Created: 2025-10-05
-- Author: Alif Hakimi
-- ============================================

-- ============================================
-- STORES TABLE
-- ============================================
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  profile_pic_url TEXT,
  banner_pic_url TEXT,
  location TEXT,
  stripe_account_id TEXT UNIQUE,
  stripe_onboarded BOOLEAN DEFAULT false,
  stripe_charges_enabled BOOLEAN DEFAULT false,
  stripe_details_submitted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stores_user_id ON stores(user_id);
CREATE INDEX idx_stores_slug ON stores(slug);

-- ============================================
-- STORE_CUSTOMIZATION TABLE
-- ============================================
CREATE TABLE store_customization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'minimal_white',
  font_family TEXT DEFAULT 'Inter',
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#666666',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  block_shape TEXT DEFAULT 'round' CHECK (block_shape IN ('square', 'round', 'pill')),
  social_icons_style TEXT DEFAULT 'background' CHECK (social_icons_style IN ('background', 'no_background')),
  layout TEXT DEFAULT 'grid',
  show_animations BOOLEAN DEFAULT true,
  show_shadows BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customization_store ON store_customization(store_id);

-- ============================================
-- SOCIAL_LINKS TABLE
-- ============================================
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN (
    'gmail', 'github', 'portfolio', 'discord', 'instagram',
    'facebook', 'twitter', 'tiktok', 'linkedin', 'youtube', 'other'
  )),
  handle TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, platform)
);

CREATE INDEX idx_social_links_store ON social_links(store_id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('link', 'lead_magnet', 'digital_product')),
  name TEXT NOT NULL,
  slug TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  position INTEGER DEFAULT 0,
  type_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, slug)
);

CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_position ON products(store_id, position);
CREATE INDEX idx_products_type_config ON products USING GIN (type_config);

-- ============================================
-- PRODUCT_REVIEWS TABLE
-- ============================================
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  customer_name TEXT NOT NULL,
  review_text TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  total_transactions INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, email)
);

CREATE INDEX idx_customers_store ON customers(store_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(full_name);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_checkout_session_id TEXT,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  download_count INTEGER DEFAULT 0,
  download_limit INTEGER DEFAULT 5,
  download_expires_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_store ON orders(store_id);
CREATE INDEX idx_orders_product ON orders(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- ============================================
-- DOWNLOADS TABLE
-- ============================================
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_downloads_order ON downloads(order_id);

-- ============================================
-- ANALYTICS_EVENTS TABLE
-- ============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'store_visit', 'product_view', 'product_click', 'lead_capture', 'purchase'
  )),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_store ON analytics_events(store_id);
CREATE INDEX idx_analytics_product ON analytics_events(product_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_store_type_date ON analytics_events(store_id, event_type, created_at DESC);

-- ============================================
-- LEAD_CAPTURES TABLE
-- ============================================
CREATE TABLE lead_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  freebie_sent BOOLEAN DEFAULT false,
  freebie_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_product ON lead_captures(product_id);
CREATE INDEX idx_leads_store ON lead_captures(store_id);
CREATE INDEX idx_leads_email ON lead_captures(email);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customization_updated_at BEFORE UPDATE ON store_customization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update customer stats on order
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE customers SET 
      total_transactions = total_transactions + 1,
      total_spent = total_spent + NEW.amount
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_customer_stats
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_customer_stats();

-- Increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders SET 
    download_count = download_count + 1,
    last_downloaded_at = NOW()
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download
  AFTER INSERT ON downloads
  FOR EACH ROW
  WHEN (NEW.success = true)
  EXECUTE FUNCTION increment_download_count();