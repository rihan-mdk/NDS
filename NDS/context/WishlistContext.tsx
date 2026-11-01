"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, PRODUCTS } from "@/lib/products-data";

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Initialize with default items from Stitch Wishlist screen
        // (Noorani Lehenga & The Noor Kundan Ring)
        setItems([
          PRODUCTS[2], // Noorani Zardozi Bridal Lehenga
          PRODUCTS[3], // The Noor Kundan Statement Ring
        ].filter(Boolean));
      }
    } catch (e) {
      console.warn("Could not load wishlist from localStorage:", e);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn("Could not save wishlist to localStorage:", e);
      }
    }
  }, [items, initialized]);

  const toggleWishlist = (product: Product) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return items.some((p) => p.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

