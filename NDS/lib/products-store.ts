"use client";

import { useEffect, useState } from "react";
import { PRODUCTS, Product } from "@/lib/products-data";

const STORAGE_KEY = "nds_custom_products_v1";
const DELETED_KEY = "nds_deleted_products_v1";
const SYNC_EVENT = "nds_products_updated";

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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
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
  return products.find((p) => p.slug === slug);
}

export function getLiveProductById(id: string): Product | undefined {
  const products = getAllLiveProducts();
  return products.find((p) => p.id === id);
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
 * React hook to subscribe to live product updates
 */
export function useLiveProducts(categoryFilter?: string): Product[] {
  const [products, setProducts] = useState<Product[]>(() => {
    const all = getAllLiveProducts();
    if (!categoryFilter || categoryFilter === "all") return all;
    return all.filter((p) => p.category === categoryFilter);
  });

  useEffect(() => {
    function update() {
      const all = getAllLiveProducts();
      if (!categoryFilter || categoryFilter === "all") {
        setProducts(all);
      } else {
        setProducts(all.filter((p) => p.category === categoryFilter));
      }
    }

    // Initial sync
    update();

    // Listen to local update events
    window.addEventListener(SYNC_EVENT, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(SYNC_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [categoryFilter]);

  return products;
}
