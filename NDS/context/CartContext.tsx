"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Product } from "@/lib/products-data";
import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string) => void;
  removeFromCart: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, newQuantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  promoCode: "",
  applyPromoCode: () => ({ success: false, message: "" }),
  removePromoCode: () => {},
  total: 0,
});

const CART_STORAGE_KEY = "nds_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const userIdRef = useRef<string | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const saveLocal = (next: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch { /* noop */ }
  };

  const loadLocal = (): CartItem[] => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  };

  // Load cart from Supabase, merge with local, push merged back
  const syncFromSupabase = async (userId: string) => {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("user_cart")
        .select("product_data, quantity, selected_size")
        .eq("user_id", userId);

      const cloudItems: CartItem[] = (data || []).map((r) => ({
        product: r.product_data as Product,
        quantity: r.quantity,
        selectedSize: r.selected_size,
      }));

      const localItems = loadLocal();

      // Merge: start with cloud items, add local-only items on top
      const merged = [...cloudItems];
      const localOnly = localItems.filter(
        (li) =>
          !cloudItems.some(
            (ci) => ci.product.id === li.product.id && ci.selectedSize === li.selectedSize
          )
      );

      if (localOnly.length > 0) {
        merged.push(...localOnly);
        // Push local-only items to Supabase
        await supabase.from("user_cart").upsert(
          localOnly.map((item) => ({
            user_id: userId,
            product_id: item.product.id,
            product_data: item.product,
            quantity: item.quantity,
            selected_size: item.selectedSize,
          }))
        );
      }

      setItems(merged);
      saveLocal(merged);
    } catch { /* noop — keep local state */ }
  };

  // ── auth listener ─────────────────────────────────────────────────────────

  useEffect(() => {
    // Load local immediately so cart icon count shows instantly
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
      if (event === "SIGNED_IN" && session?.user && session.user.id !== "admin-usr-neels") {
        userIdRef.current = session.user.id;
        syncFromSupabase(session.user.id);
      } else if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        setItems([]);
        setPromoCode("");
        setDiscountPercent(0);
        try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* noop */ }
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── mutations ─────────────────────────────────────────────────────────────

  const addToCart = (product: Product, quantity = 1, selectedSize = "M") => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.selectedSize === selectedSize
      );
      let next: CartItem[];
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + quantity,
        };
        next = copy;
      } else {
        next = [...prev, { product, quantity, selectedSize }];
      }

      saveLocal(next);

      const uid = userIdRef.current;
      if (uid) {
        const supabase = createClient();
        const newQty = existingIndex > -1
          ? prev[existingIndex].quantity + quantity
          : quantity;
        supabase
          .from("user_cart")
          .upsert({
            user_id: uid,
            product_id: product.id,
            product_data: product,
            quantity: newQty,
            selected_size: selectedSize,
          })
          .then(() => {});
      }

      return next;
    });
  };

  const removeFromCart = (productId: string, selectedSize: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (i) => !(i.product.id === productId && i.selectedSize === selectedSize)
      );
      saveLocal(next);

      const uid = userIdRef.current;
      if (uid) {
        const supabase = createClient();
        supabase
          .from("user_cart")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", productId)
          .eq("selected_size", selectedSize)
          .then(() => {});
      }

      return next;
    });
  };

  const updateQuantity = (productId: string, selectedSize: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setItems((prev) => {
      const next = prev.map((item) =>
        item.product.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: newQuantity }
          : item
      );
      saveLocal(next);

      const uid = userIdRef.current;
      if (uid) {
        const supabase = createClient();
        supabase
          .from("user_cart")
          .update({ quantity: newQuantity })
          .eq("user_id", uid)
          .eq("product_id", productId)
          .eq("selected_size", selectedSize)
          .then(() => {});
      }

      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode("");
    setDiscountPercent(0);
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* noop */ }

    const uid = userIdRef.current;
    if (uid) {
      const supabase = createClient();
      supabase
        .from("user_cart")
        .delete()
        .eq("user_id", uid)
        .then(() => {});
    }
  };

  const applyPromoCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "ATELIER10" || formatted === "NEELS10") {
      setPromoCode(formatted);
      setDiscountPercent(10);
      return { success: true, message: "10% Atelier Privé voucher applied." };
    }
    if (formatted === "HERITAGE15") {
      setPromoCode(formatted);
      setDiscountPercent(15);
      return { success: true, message: "15% Heritage Privé voucher applied." };
    }
    return { success: false, message: "Invalid voucher or promotion code." };
  };

  const removePromoCode = () => {
    setPromoCode("");
    setDiscountPercent(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * (discountPercent / 100));
  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 1500;
  const tax = Math.round((subtotal - discount) * 0.12);
  const total = subtotal - discount + tax + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        tax,
        shipping,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
