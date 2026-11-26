-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — COMPLETE RLS & SECURITY ADVISOR REMEDIATION
-- Migration: 20261126_fix_rls_and_advisor_warnings.sql
-- Description:
-- 1. Resolves "Auth RLS Initialization Plan" by wrapping auth.uid() in (select auth.uid())
-- 2. Resolves "RLS Policy Always True" on orders and order_items with proper scoped checks
-- 3. Resolves "Multiple Permissive Policies" on products by consolidating duplicate policies
-- 4. Resolves "Unindexed foreign keys" by creating indexes on foreign key columns
-- ==============================================================================

-- ==============================================================================
-- PART 1: INDEXES ON FOREIGN KEYS (Resolves "Unindexed foreign keys" warnings)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id 
  ON public.user_addresses (user_id);

CREATE INDEX IF NOT EXISTS idx_user_cart_user_id 
  ON public.user_cart (user_id);

CREATE INDEX IF NOT EXISTS idx_user_cart_product_id 
  ON public.user_cart (product_id);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id 
  ON public.user_wishlist (user_id);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_product_id 
  ON public.user_wishlist (product_id);


-- ==============================================================================
-- PART 2: PROFILES TABLE (Resolves "Auth RLS Initialization Plan")
-- ==============================================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_service_role"
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 3: USER_ADDRESSES TABLE (Resolves "Auth RLS Initialization Plan")
-- ==============================================================================

ALTER TABLE IF EXISTS public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_addresses_select_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_insert_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_update_own" ON public.user_addresses;
DROP POLICY IF EXISTS "user_addresses_delete_own" ON public.user_addresses;
DROP POLICY IF EXISTS "Service role full access user_addresses" ON public.user_addresses;

CREATE POLICY "user_addresses_select_own"
  ON public.user_addresses FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_insert_own"
  ON public.user_addresses FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_update_own"
  ON public.user_addresses FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_delete_own"
  ON public.user_addresses FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_service_role"
  ON public.user_addresses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 4: ORDERS TABLE (Resolves "Auth RLS Init Plan" & "RLS Policy Always True")
-- ==============================================================================

ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_patron" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "Anyone can place orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
DROP POLICY IF EXISTS "orders_service_role" ON public.orders;

-- Authenticated patrons can read their own orders; guests verify via token hash or server API
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Anyone can place an order, but if user_id is provided it must match authenticated patron
CREATE POLICY "orders_insert_patron"
  ON public.orders FOR INSERT
  WITH CHECK (
    user_id IS NULL OR user_id = (select auth.uid())
  );

CREATE POLICY "orders_service_role"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 5: ORDER_ITEMS TABLE (Resolves "Auth RLS Init Plan" & "RLS Policy Always True")
-- ==============================================================================

ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_patron" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can add order items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_service_role" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;

CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "order_items_insert_patron"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id IS NULL OR orders.user_id = (select auth.uid()))
    )
  );

CREATE POLICY "order_items_service_role"
  ON public.order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 6: USER_CART TABLE (Resolves "Auth RLS Initialization Plan")
-- ==============================================================================

ALTER TABLE IF EXISTS public.user_cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_cart_select_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_insert_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_update_own" ON public.user_cart;
DROP POLICY IF EXISTS "user_cart_delete_own" ON public.user_cart;
DROP POLICY IF EXISTS "Service role full access user_cart" ON public.user_cart;

CREATE POLICY "user_cart_select_own"
  ON public.user_cart FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_insert_own"
  ON public.user_cart FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_update_own"
  ON public.user_cart FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_delete_own"
  ON public.user_cart FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_service_role"
  ON public.user_cart FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 7: USER_WISHLIST TABLE (Resolves "Auth RLS Initialization Plan")
-- ==============================================================================

ALTER TABLE IF EXISTS public.user_wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_wishlist_select_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_insert_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_update_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "user_wishlist_delete_own" ON public.user_wishlist;
DROP POLICY IF EXISTS "Service role full access user_wishlist" ON public.user_wishlist;

CREATE POLICY "user_wishlist_select_own"
  ON public.user_wishlist FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_insert_own"
  ON public.user_wishlist FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_update_own"
  ON public.user_wishlist FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_delete_own"
  ON public.user_wishlist FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_service_role"
  ON public.user_wishlist FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- PART 8: PRODUCTS TABLE (Resolves "Multiple Permissive Policies")
-- ==============================================================================

ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- Clean drop of all redundant duplicate permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Allow public read" ON public.products;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_read_all" ON public.products;
DROP POLICY IF EXISTS "products_all_service_role" ON public.products;
DROP POLICY IF EXISTS "Allow service role full access" ON public.products;
DROP POLICY IF EXISTS "Service role full access products" ON public.products;

-- Exactly ONE clean public read policy
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

-- Exactly ONE service role administrative policy
CREATE POLICY "products_service_role"
  ON public.products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
