-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Created: 2025-10-05
-- Description: Security policies for all tables
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STORES POLICIES
-- ============================================

-- Users can view their own store
CREATE POLICY "Users can view own store"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own store (one per user)
CREATE POLICY "Users can insert own store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own store
CREATE POLICY "Users can update own store"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own store
CREATE POLICY "Users can delete own store"
  ON stores FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view any store (for public store pages)
CREATE POLICY "Public can view all stores"
  ON stores FOR SELECT
  USING (true);

-- ============================================
-- STORE_CUSTOMIZATION POLICIES
-- ============================================

-- Users can manage their store customization
CREATE POLICY "Users can manage own customization"
  ON store_customization FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_customization.store_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_customization.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can view customization (for rendering store pages)
CREATE POLICY "Public can view customization"
  ON store_customization FOR SELECT
  USING (true);

-- ============================================
-- SOCIAL_LINKS POLICIES
-- ============================================

-- Users can manage their social links
CREATE POLICY "Users can manage own social links"
  ON social_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = social_links.store_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = social_links.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can view social links
CREATE POLICY "Public can view social links"
  ON social_links FOR SELECT
  USING (true);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Users can manage their own products
CREATE POLICY "Users can manage own products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can view published products
CREATE POLICY "Public can view published products"
  ON products FOR SELECT
  USING (status = 'published');

-- Users can view their own draft products
CREATE POLICY "Users can view own draft products"
  ON products FOR SELECT
  USING (
    status = 'draft' AND
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- ============================================
-- PRODUCT_REVIEWS POLICIES
-- ============================================

-- Store owners can manage reviews for their products
CREATE POLICY "Store owners can manage reviews"
  ON product_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM products
      JOIN stores ON stores.id = products.store_id
      WHERE products.id = product_reviews.product_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      JOIN stores ON stores.id = products.store_id
      WHERE products.id = product_reviews.product_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can view reviews
CREATE POLICY "Public can view reviews"
  ON product_reviews FOR SELECT
  USING (true);

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================

-- Store owners can view their customers
CREATE POLICY "Store owners can view customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = customers.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Store owners can update customer records
CREATE POLICY "Store owners can update customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = customers.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Service role can insert customers (from webhooks)
-- No policy needed - service role bypasses RLS

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Store owners can view their orders
CREATE POLICY "Store owners can view orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Store owners can update their orders (for refunds, status changes)
CREATE POLICY "Store owners can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
        AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Customers can view their own orders (by email)
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

-- Service role can insert orders (from Stripe webhooks)
-- No policy needed - service role bypasses RLS

-- ============================================
-- DOWNLOADS POLICIES
-- ============================================

-- Store owners can view download logs
CREATE POLICY "Store owners can view downloads"
  ON downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN stores ON stores.id = orders.store_id
      WHERE orders.id = downloads.order_id
        AND stores.user_id = auth.uid()
    )
  );

-- Service role can insert downloads (from download endpoint)
-- No policy needed - service role bypasses RLS

-- ============================================
-- ANALYTICS_EVENTS POLICIES
-- ============================================

-- Store owners can view their analytics
CREATE POLICY "Store owners can view analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = analytics_events.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can insert analytics events (tracking page views, clicks)
CREATE POLICY "Public can insert analytics"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- ============================================
-- LEAD_CAPTURES POLICIES
-- ============================================

-- Store owners can view their leads
CREATE POLICY "Store owners can view leads"
  ON lead_captures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = lead_captures.store_id
        AND stores.user_id = auth.uid()
    )
  );

-- Public can insert lead captures (from lead magnet forms)
CREATE POLICY "Public can insert leads"
  ON lead_captures FOR INSERT
  WITH CHECK (true);

-- Store owners can update leads (mark as sent, etc)
CREATE POLICY "Store owners can update leads"
  ON lead_captures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = lead_captures.store_id
        AND stores.user_id = auth.uid()
    )
  );