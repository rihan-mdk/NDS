"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Product } from "@/lib/products-data";
import { createClient } from "@/lib/supabase/client";

interface WishlistContextType {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  removeFromWishlist: () => {},
  clearWishlist: () => {},
});

const WISHLIST_STORAGE_KEY = "nds_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const userIdRef = useRef<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const saveLocal = (next: Product[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch { /* noop */ }
  };

  const loadLocal = (): Product[] => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  };

  // Load wishlist from Supabase and merge with local items, then push merged
  const syncFromSupabase = async (userId: string) => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("user_wishlist")
        .select("product_data")
        .eq("user_id", userId);

      const cloudItems: Product[] = (data || []).map((r) => r.product_data as Product);
      const localItems = loadLocal();

      // Merge: union of cloud + local (local items not yet in cloud get upserted)
      const merged = [...cloudItems];
      const cloudIds = new Set(cloudItems.map((p) => p.id));
      const localOnly = localItems.filter((p) => !cloudIds.has(p.id));

      if (localOnly.length > 0) {
        merged.push(...localOnly);
        // Push local-only items up to Supabase
        await supabase.from("user_wishlist").upsert(
          localOnly.map((p) => ({
            user_id: userId,
            product_id: p.id,
            product_data: p,
          }))
        );
      }

      setItems(merged);
      saveLocal(merged);
    } catch { /* noop — keep local state */ }
  };

  // ── auth listener ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Load local immediately so UI isn't blank
    const local = loadLocal();
    if (local.length > 0) setItems(local);

    const supabase = createClient();

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && session.user.id !== "admin-usr-neels") {
        userIdRef.current = session.user.id;
        syncFromSupabase(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN") && session?.user && session.user.id !== "admin-usr-neels") {
        userIdRef.current = session.user.id;
        syncFromSupabase(session.user.id);
      } else if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        setItems([]);
        try { localStorage.removeItem(WISHLIST_STORAGE_KEY); } catch { /* noop */ }
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── mutations ─────────────────────────────────────────────────────────────

  const toggleWishlist = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const next = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];

      saveLocal(next);

      // Sync to Supabase in background
      const uid = userIdRef.current;
      if (uid) {
        const supabase = createClient();
        if (exists) {
          supabase
            .from("user_wishlist")
            .delete()
            .eq("user_id", uid)
            .eq("product_id", product.id)
            .then(() => {});
        } else {
          supabase
            .from("user_wishlist")
            .upsert({ user_id: uid, product_id: product.id, product_data: product })
            .then(() => {});
        }
      }

      return next;
    });
  };

  const isInWishlist = (productId: string) => items.some((p) => p.id === productId);

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      saveLocal(next);

      const uid = userIdRef.current;
      if (uid) {
        const supabase = createClient();
        supabase
          .from("user_wishlist")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", productId)
          .then(() => {});
      }

      return next;
    });
  };

  const clearWishlist = () => {
    setItems([]);
    try { localStorage.removeItem(WISHLIST_STORAGE_KEY); } catch { /* noop */ }

    const uid = userIdRef.current;
    if (uid) {
      const supabase = createClient();
      supabase
        .from("user_wishlist")
        .delete()
        .eq("user_id", uid)
        .then(() => {});
    }
  };

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isInWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
