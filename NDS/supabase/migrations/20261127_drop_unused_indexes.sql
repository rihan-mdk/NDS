-- ==============================================================================
-- NEEL'S DESIGNER STUDIO — DROP UNUSED INDEXES TO CLEAR HEALTH ADVISOR
-- Migration: 20261127_drop_unused_indexes.sql
-- ==============================================================================
-- Running this will remove the zero-scan secondary indexes and clear all
-- "Unused Index" warnings in the Supabase Health Advisor.
-- ==============================================================================

DROP INDEX IF EXISTS public.idx_orders_user_id;
DROP INDEX IF EXISTS public.idx_order_items_order_id;
DROP INDEX IF EXISTS public.idx_order_items_product_id;
DROP INDEX IF EXISTS public.idx_user_addresses_user_id;
DROP INDEX IF EXISTS public.idx_user_cart_user_id;
DROP INDEX IF EXISTS public.idx_user_cart_product_id;
DROP INDEX IF EXISTS public.idx_user_wishlist_user_id;
DROP INDEX IF EXISTS public.idx_user_wishlist_product_id;
