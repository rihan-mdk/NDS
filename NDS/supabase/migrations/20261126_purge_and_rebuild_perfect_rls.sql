-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — COMPLETE RLS PURGE & PERFECT CLEAN REBUILD
-- Migration: 20261126_purge_and_rebuild_perfect_rls.sql
-- ==============================================================================
-- This script completely resolves:
-- 1. "Multiple Permissive Policies" on ALL tables (wipes all duplicate/stale policies)
-- 2. "Auth RLS Initialization Plan" (uses (select auth.uid()) for optimal init plans)
-- 3. "RLS Policy Always True" (eliminates unconditional true on sensitive data)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: CLEANLY DROP ALL EXISTING POLICIES FROM PUBLIC TABLES
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('orders', 'order_items', 'profiles', 'user_addresses', 'user_cart', 'user_wishlist', 'products', 'product_reviews')
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 2: ENSURE ROW LEVEL SECURITY IS ACTIVE ON ALL TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- STEP 3: PROFILES (Exactly 1 policy per command — No multiple permissive overlap)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- STEP 4: USER_ADDRESSES (Exactly 1 policy per command)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- STEP 5: ORDERS (Exactly 1 policy per command — No Always True on public)
-- ------------------------------------------------------------------------------
-- Authenticated patrons can select only their own orders
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Anyone can place an order, but if user_id is provided it must match auth.uid()
CREATE POLICY "orders_insert_patron"
  ON public.orders FOR INSERT
  TO public
  WITH CHECK (
    user_id IS NULL OR user_id = (select auth.uid())
  );

-- ------------------------------------------------------------------------------
-- STEP 6: ORDER_ITEMS (Exactly 1 policy per command — Scoped validation)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- STEP 7: USER_CART (Exactly 1 policy per command)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- STEP 8: USER_WISHLIST (Exactly 1 policy per command)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- STEP 9: PRODUCTS (Single clean public read policy — Zero duplicate policies)
-- ------------------------------------------------------------------------------
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  TO public
  USING (true);

-- ------------------------------------------------------------------------------
-- STEP 10: PRODUCT_REVIEWS (If table exists)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_reviews') THEN
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
