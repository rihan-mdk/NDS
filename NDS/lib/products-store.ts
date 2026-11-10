"use client";

import { useEffect, useState } from "react";
import { PRODUCTS, Product } from "@/lib/products-data";

const STORAGE_KEY = "nds_custom_products_v1";
const DELETED_KEY = "nds_deleted_products_v1";
const SYNC_EVENT = "nds_products_updated";

export const KNOWN_DELETED_BASE_IDS: string[] = [
  "prod-001", "prod-002", "prod-003", "prod-004",
  "prod-005", "prod-006", "prod-007", "prod-008",
  "prod-009", "prod-010", "prod-011", "prod-012",
  "prod-013", "prod-014", "prod-015", "prod-016",
];

export function getCustomProductsFromStorage(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function getDeletedIdsFromStorage(): string[] {
  if (typeof window === "undefined") return [...KNOWN_DELETED_BASE_IDS];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    const stored: string[] = raw ? JSON.parse(raw) : [];
    return Array.from(new Set([...KNOWN_DELETED_BASE_IDS, ...stored]));
  } catch (e) {
    return [...KNOWN_DELETED_BASE_IDS];
  }
}

export function getAllLiveProducts(): Product[] {
  const custom = getCustomProductsFromStorage();
  const deletedIds = new Set(getDeletedIdsFromStorage());
  const customIds = new Set(custom.map((p) => p.id));

  // Base products excluding any deleted ones or overridden ones
  const base = PRODUCTS.filter((p) => !deletedIds.has(p.id) && !customIds.has(p.id));
  const activeCustom = custom.filter((p) => !deletedIds.has(p.id));

  return [...activeCustom, ...base];
}

export function getLiveProductBySlug(slug: string): Product | undefined {
  const products = getAllLiveProducts();
  return products.find((p) => p.slug === slug || p.id === slug);
}

export function getLiveProductById(id: string): Product | undefined {
  const products = getAllLiveProducts();
  return products.find((p) => p.id === id || p.slug === id);
}

export function saveProductToStorage(product: Product) {
  if (typeof window === "undefined") return;
  try {
    const custom = getCustomProductsFromStorage();
    const existingIndex = custom.findIndex((p) => p.id === product.id);

    let updated: Product[];
    if (existingIndex > -1) {
      updated = [...custom];
      updated[existingIndex] = product;
    } else {
      updated = [product, ...custom];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Remove from deleted list if it was previously there
    const deleted = getDeletedIdsFromStorage().filter((id) => id !== product.id);
    localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));

    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (e) {
    console.error("Failed to save product to storage:", e);
  }
}

export function deleteProductFromStorage(id: string) {
  if (typeof window === "undefined") return;
  try {
    const custom = getCustomProductsFromStorage().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));

    const deleted = getDeletedIdsFromStorage();
    if (!deleted.includes(id)) {
      deleted.push(id);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deleted));
    }

    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (e) {
    console.error("Failed to delete product from storage:", e);
  }
}

/**
 * React hook to subscribe to live product updates.
 * SSR and initial client hydration start with base PRODUCTS to guarantee zero hydration mismatch,
 * then cleanly synchronize live products from Supabase and client storage in useEffect.
 */
export function useLiveProducts(categoryFilter?: string): Product[] {
  const [products, setProducts] = useState<Product[]>(() => {
    const all = getAllLiveProducts();
    if (!categoryFilter || categoryFilter === "all") return all;
    return all.filter((p) => p.category === categoryFilter);
  });

  useEffect(() => {
    function updateLocal() {
      const all = getAllLiveProducts();
      if (!categoryFilter || categoryFilter === "all") {
        setProducts(all);
      } else {
        setProducts(all.filter((p) => p.category === categoryFilter));
      }
    }

    // 1. Immediately sync with local storage on mount (0ms latency, eliminates glitch)
    updateLocal();

    // 2. Synchronize with cloud database in background
    async function syncFromCloud() {
      try {
        const res = await fetch(`/api/admin/products?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();

          // Synchronize server-tracked deleted IDs into localStorage
          if (Array.isArray(data.deletedIds) && data.deletedIds.length > 0 && typeof window !== "undefined") {
            try {
              const currentDeleted = new Set([...getDeletedIdsFromStorage(), ...data.deletedIds]);
              localStorage.setItem(DELETED_KEY, JSON.stringify(Array.from(currentDeleted)));
            } catch {}
          }

          if (Array.isArray(data.products)) {
            const deletedIds = new Set(getDeletedIdsFromStorage());
            const liveOnly = data.products.filter((p: Product) => !deletedIds.has(p.id));

            // Sync custom products into localStorage so subsequent navigations are instant
            const baseIds = new Set(PRODUCTS.map((p) => p.id));
            const customFromCloud = liveOnly.filter((p: Product) => !baseIds.has(p.id));
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(customFromCloud));
              } catch {}
            }

            if (!categoryFilter || categoryFilter === "all") {
              setProducts(liveOnly);
            } else {
              setProducts(liveOnly.filter((p: Product) => p.category === categoryFilter));
            }
            return;
          }
        }
      } catch (e) {
        // Fallback to local storage if API call fails
      }
      updateLocal();
    }

    syncFromCloud();

    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncFromCloud();
      }
    };

    // Listen to local update events and window focus for instantaneous updates without network delay
    window.addEventListener(SYNC_EVENT, updateLocal);
    window.addEventListener("storage", updateLocal);
    window.addEventListener("focus", syncFromCloud);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      window.removeEventListener(SYNC_EVENT, updateLocal);
      window.removeEventListener("storage", updateLocal);
      window.removeEventListener("focus", syncFromCloud);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [categoryFilter]);

  return products;
}
