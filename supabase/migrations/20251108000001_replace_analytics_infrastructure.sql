-- Replace Analytics Infrastructure
-- This migration drops the old analytics_events table and replaces it with a comprehensive analytics system
-- Includes: events, sessions, daily stats, and product stats with UTM tracking and RLS policies

-- ============================================================================
-- DROP OLD ANALYTICS TABLE
-- ============================================================================

-- Drop old policies first
DROP POLICY IF EXISTS "Store owners can view analytics" ON analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics" ON analytics_events;

-- Drop old table
DROP TABLE IF EXISTS analytics_events CASCADE;

-- ============================================================================
-- 1. SESSIONS TABLE - Unique visitor tracking
-- ============================================================================
-- Create sessions first since events will reference it
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Session data
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_views INTEGER NOT NULL DEFAULT 0,

  -- Traffic source (captured on first visit)
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Metadata
  user_agent TEXT,
  ip_hash TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_store_id ON sessions(store_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_utm_source ON sessions(utm_source) WHERE utm_source IS NOT NULL;

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
-- Anyone can insert/update sessions (for tracking)
CREATE POLICY "Anyone can insert sessions" ON sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" ON sessions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Store owners can read their own sessions
CREATE POLICY "Store owners can view their own sessions" ON sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = sessions.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 2. EVENTS TABLE - Append-only event tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  -- Event data
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_click', 'lead_submit', 'purchase')),
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Traffic source tracking (UTM parameters)
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  -- Request metadata
  user_agent TEXT,
  ip_hash TEXT, -- Privacy-friendly hashed IP

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_events_store_id ON events(store_id);
CREATE INDEX idx_events_product_id ON events(product_id) WHERE product_id IS NOT NULL;
CREATE INDEX idx_events_session_id ON events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_events_utm_source ON events(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_events_store_created ON events(store_id, created_at DESC);
CREATE INDEX idx_events_product_type ON events(product_id, event_type) WHERE product_id IS NOT NULL;

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
-- Anyone can insert events (public storefronts)
CREATE POLICY "Anyone can insert events" ON events
  FOR INSERT
  WITH CHECK (true);

-- Store owners can read their own events
CREATE POLICY "Store owners can view their own events" ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = events.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. STORE DAILY STATS - Pre-aggregated daily metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Date (one row per store per day)
  date DATE NOT NULL,

  -- Metrics
  total_views INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_leads INTEGER NOT NULL DEFAULT 0,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one row per store per day
  UNIQUE(store_id, date)
);

-- Indexes
CREATE INDEX idx_store_daily_stats_store_id ON store_daily_stats(store_id);
CREATE INDEX idx_store_daily_stats_date ON store_daily_stats(date DESC);
CREATE INDEX idx_store_daily_stats_store_date ON store_daily_stats(store_id, date DESC);

-- Enable RLS
ALTER TABLE store_daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Store owners can read their own stats
CREATE POLICY "Store owners can view their own daily stats" ON store_daily_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_daily_stats.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- System can insert/update (via triggers or cron jobs)
CREATE POLICY "Service role can manage daily stats" ON store_daily_stats
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- 4. PRODUCT STATS - Real-time product counters
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys (one row per product)
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,

  -- Real-time counters
  total_views INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_stats_product_id ON product_stats(product_id);
CREATE INDEX idx_product_stats_store_id ON product_stats(store_id);

-- Enable RLS
ALTER TABLE product_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Store owners can read their own product stats
CREATE POLICY "Store owners can view their own product stats" ON product_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = product_stats.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Anyone can insert (will be created on first event)
CREATE POLICY "Anyone can insert product stats" ON product_stats
  FOR INSERT
  WITH CHECK (true);

-- Anyone can update (via triggers)
CREATE POLICY "Anyone can update product stats" ON product_stats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. HELPER FUNCTIONS
-- ============================================================================

-- Function to increment product stats
CREATE OR REPLACE FUNCTION increment_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if product_id is present
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert or update product_stats
  INSERT INTO product_stats (product_id, store_id, total_views, total_clicks, total_conversions, total_revenue)
  VALUES (
    NEW.product_id,
    NEW.store_id,
    CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'product_click' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type IN ('lead_submit', 'purchase') THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'purchase' THEN COALESCE((NEW.event_data->>'amount')::decimal, 0) ELSE 0 END
  )
  ON CONFLICT (product_id) DO UPDATE
  SET
    total_views = product_stats.total_views + CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
    total_clicks = product_stats.total_clicks + CASE WHEN NEW.event_type = 'product_click' THEN 1 ELSE 0 END,
    total_conversions = product_stats.total_conversions + CASE WHEN NEW.event_type IN ('lead_submit', 'purchase') THEN 1 ELSE 0 END,
    total_revenue = product_stats.total_revenue + CASE WHEN NEW.event_type = 'purchase' THEN COALESCE((NEW.event_data->>'amount')::decimal, 0) ELSE 0 END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update session last_seen
CREATE OR REPLACE FUNCTION update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if session_id is present
  IF NEW.session_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update session last_seen and increment page_views
  UPDATE sessions
  SET
    last_seen = NOW(),
    page_views = page_views + 1,
    updated_at = NOW()
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger to increment product stats on event insert (only for product events)
CREATE TRIGGER trigger_increment_product_stats
  AFTER INSERT ON events
  FOR EACH ROW
  WHEN (NEW.product_id IS NOT NULL)
  EXECUTE FUNCTION increment_product_stats();

-- Trigger to update session last_seen on page view
CREATE TRIGGER trigger_update_session_last_seen
  AFTER INSERT ON events
  FOR EACH ROW
  WHEN (NEW.event_type = 'page_view' AND NEW.session_id IS NOT NULL)
  EXECUTE FUNCTION update_session_last_seen();

-- ============================================================================
-- NOTES
-- ============================================================================
-- This migration replaces the old analytics_events table with:
-- 1. events table - stores all user interactions with UTM tracking
-- 2. sessions table - tracks unique visitors
-- 3. store_daily_stats - pre-aggregated daily metrics (populated by cron job)
-- 4. product_stats - real-time product performance counters
-- 5. RLS policies - public can insert events, store owners can read their data
-- 6. Indexes - optimized for common query patterns
-- 7. Triggers - auto-update product_stats and sessions
-- 8. Helper functions - reusable logic for stats updates
--
-- Key improvements over old analytics_events:
-- - UTM parameter tracking (utm_source, utm_medium, utm_campaign, etc.)
-- - Session management for unique visitor tracking
-- - Pre-aggregated stats for faster dashboard queries
-- - Real-time product performance counters
-- - Privacy-friendly IP hashing instead of storing raw IPs
-- - Better event types ('page_view', 'product_click', 'lead_submit', 'purchase')
