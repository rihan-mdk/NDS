-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — FINAL RLS CLEANUP & INDEX REBUILD
-- Migration: 20261127_final_rls_cleanup_and_indexes.sql
-- Resolves:
--   1. Multiple Permissive Policies on all tables (complete drop + single rebuild)
--   2. Auth RLS Initialization Plan (using (select auth.uid()) throughout)
--   3. Unindexed foreign keys on order_items, orders, user_addresses
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: DROP ALL EXISTING POLICIES DYNAMICALLY
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'orders', 'order_items', 'profiles',
            'user_addresses', 'user_cart', 'user_wishlist',
            'products', 'product_reviews'
          )
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: ENSURE RLS IS ENABLED ON ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_addresses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_cart         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_wishlist     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products          ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: PROFILES — 1 policy per action, using (select auth.uid())
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_delete_own"
  ON public.profiles FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: USER_ADDRESSES — 1 policy per action
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "user_addresses_select_own"
  ON public.user_addresses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_insert_own"
  ON public.user_addresses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_update_own"
  ON public.user_addresses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_addresses_delete_own"
  ON public.user_addresses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: ORDERS — 1 policy per action
--   • Authenticated users read only their own orders
--   • Anyone can place an order (guest or auth); if user_id set, it must match
--   • Service role (admin) has unrestricted access via bypass_rls
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "orders_insert_patron"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR user_id = (select auth.uid())
  );

CREATE POLICY "orders_update_own"
  ON public.orders FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: ORDER_ITEMS — scoped via parent order ownership
-- ─────────────────────────────────────────────────────────────────────────────
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
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id IS NULL OR orders.user_id = (select auth.uid()))
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 7: USER_CART — 1 policy per action
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "user_cart_select_own"
  ON public.user_cart FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_insert_own"
  ON public.user_cart FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_update_own"
  ON public.user_cart FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_cart_delete_own"
  ON public.user_cart FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 8: USER_WISHLIST — 1 policy per action
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "user_wishlist_select_own"
  ON public.user_wishlist FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_insert_own"
  ON public.user_wishlist FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_update_own"
  ON public.user_wishlist FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "user_wishlist_delete_own"
  ON public.user_wishlist FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 9: PRODUCTS — Public read only (admin writes via service_role / bypass RLS)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  TO public
  USING (
    -- Only expose non-tombstone products to public
    category != 'deleted'
    AND title != '__DELETED__'
    AND slug NOT LIKE 'deleted-%'
    AND category != '__category__'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 10: PRODUCT_REVIEWS (conditional — if table exists)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_reviews'
  ) THEN
    CREATE POLICY "product_reviews_select_public"
      ON public.product_reviews FOR SELECT
      TO public
      USING (true);

    CREATE POLICY "product_reviews_insert_own"
      ON public.product_reviews FOR INSERT
      TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);

    CREATE POLICY "product_reviews_update_own"
      ON public.product_reviews FOR UPDATE
      TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);

    CREATE POLICY "product_reviews_delete_own"
      ON public.product_reviews FOR DELETE
      TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 11: FOREIGN KEY INDEXES (resolves "Unindexed foreign keys" advisor warnings)
-- ─────────────────────────────────────────────────────────────────────────────
-- Drop old indexes first to avoid conflicts, then recreate
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;
DROP INDEX IF EXISTS idx_user_addresses_user_id;
DROP INDEX IF EXISTS idx_user_cart_user_id;
DROP INDEX IF EXISTS idx_user_wishlist_user_id;

CREATE INDEX idx_orders_user_id              ON public.orders (user_id);
CREATE INDEX idx_order_items_order_id        ON public.order_items (order_id);
CREATE INDEX idx_order_items_product_id      ON public.order_items (product_id);
CREATE INDEX idx_user_addresses_user_id      ON public.user_addresses (user_id);
CREATE INDEX idx_user_cart_user_id           ON public.user_cart (user_id);
CREATE INDEX idx_user_wishlist_user_id       ON public.user_wishlist (user_id);
