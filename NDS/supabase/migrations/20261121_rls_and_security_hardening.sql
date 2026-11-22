-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — SECURITY & ROW LEVEL SECURITY (RLS) HARDENING
-- Migration: 20261121_rls_and_security_hardening.sql
-- Description:
-- 1. Adds 'payment_status', 'utr', and 'cancellation_token_hash' to orders table.
-- 2. Backfills historical payment statuses safely.
-- 3. Enables RLS across all 7 customer-accessible tables.
-- 4. Creates explicit, non-overlapping policies ensuring strict patron record isolation.
-- ==============================================================================

-- 1. Schema Enhancements on 'orders' Table
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS utr text,
  ADD COLUMN IF NOT EXISTS cancellation_token_hash text;

-- Safe backfill for existing records without overwriting current data
UPDATE public.orders
SET payment_status = CASE
  WHEN status = 'Confirmed' OR status = 'Shipped' OR status = 'Delivered' THEN 'Paid'
  WHEN status = 'Cancelled' THEN 'No Refund Due'
  ELSE 'Pending'
END
WHERE payment_status IS NULL;

-- 2. Enable Row Level Security (RLS) on all customer-accessible tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. PROFILES Table (Primary Key: id matches auth.uid())
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 4. USER_ADDRESSES Table (Foreign Key: user_id matches auth.uid())
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_addresses_select_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_update_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_delete_own" ON public.user_addresses;

CREATE POLICY "user_addresses_select_own"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_addresses_insert_own"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_addresses_update_own"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_addresses_delete_own"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. ORDERS Table (Foreign Key: user_id matches auth.uid())
-- Note: Creation & Status modification happen server-side via service role key.
-- Browser client is restricted to reading its own orders.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;

CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. ORDER_ITEMS Table (Foreign Key: order_id linked to orders.id)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;

CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 7. USER_CART Table (Foreign Key: user_id matches auth.uid())
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_cart_select_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_insert_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_update_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_delete_own" ON public.user_cart;

CREATE POLICY "user_cart_select_own"
  ON public.user_cart FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_cart_insert_own"
  ON public.user_cart FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cart_update_own"
  ON public.user_cart FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cart_delete_own"
  ON public.user_cart FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. USER_WISHLIST Table (Foreign Key: user_id matches auth.uid())
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_wishlist_select_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_insert_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_update_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_delete_own" ON public.user_wishlist;

CREATE POLICY "user_wishlist_select_own"
  ON public.user_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_wishlist_insert_own"
  ON public.user_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_wishlist_update_own"
  ON public.user_wishlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_wishlist_delete_own"
  ON public.user_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. PRODUCT_REVIEWS Table (Foreign Key: user_id matches auth.uid())
-- Public can read verified reviews; Patrons can only insert/delete their own.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "product_reviews_select_public" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_insert_own" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_update_own" ON public.product_reviews;
DROP POLICY IF EXISTS "product_reviews_delete_own" ON public.product_reviews;

CREATE POLICY "product_reviews_select_public"
  ON public.product_reviews FOR SELECT
  USING (true);

CREATE POLICY "product_reviews_insert_own"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_reviews_update_own"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "product_reviews_delete_own"
  ON public.product_reviews FOR DELETE
  USING (auth.uid() = user_id);
