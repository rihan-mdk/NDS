-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — INDEX THE 3 FLAGGED FOREIGN KEYS
-- Migration: 20261127_index_flagged_foreign_keys.sql
-- ==============================================================================
-- Resolves the 3 "Unindexed foreign keys" notices for:
-- 1. public.orders (user_id)
-- 2. public.order_items (order_id, product_id)
-- 3. public.user_addresses (user_id)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON public.orders (user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id 
  ON public.user_addresses (user_id);
