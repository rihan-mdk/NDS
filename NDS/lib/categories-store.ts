"use client";

import { useEffect, useState } from "react";
import { AtelierCategory, CATEGORIES_LIST, ACCESSORIES_CATEGORIES } from "@/lib/products-data";
import {
  DEFAULT_CLOTHING_CATEGORIES,
  DEFAULT_ACCESSORY_CATEGORIES,
} from "@/lib/categories-data";

export { DEFAULT_CLOTHING_CATEGORIES, DEFAULT_ACCESSORY_CATEGORIES };

const STORAGE_KEY = "nds_custom_categories_v1";
const SYNC_EVENT = "nds_categories_updated";

export function getCustomCategoriesFromStorage(): AtelierCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllCategories(): AtelierCategory[] {
  const custom = getCustomCategoriesFromStorage();
  const customSlugs = new Set(custom.map((c) => c.slug));
  const base = [
    ...DEFAULT_CLOTHING_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
    ...DEFAULT_ACCESSORY_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
  ];
  return [...custom, ...base];
}

export function getAllClothingCategories(): AtelierCategory[] {
  return getAllCategories().filter((c) => c.type === "clothing");
}

export function getAllAccessoryCategories(): AtelierCategory[] {
  return getAllCategories().filter((c) => c.type === "accessory");
}

export function saveCategoryToStorage(category: AtelierCategory) {
  if (typeof window === "undefined") return;
  try {
    const itemWithAlt: AtelierCategory = {
      ...category,
      alt: category.alt || `Artisanal Handcrafted ${category.name}`,
    };
    const current = getCustomCategoriesFromStorage();
    const existingIndex = current.findIndex((c) => c.slug === itemWithAlt.slug || c.id === itemWithAlt.id);
    let updated: AtelierCategory[];
    if (existingIndex > -1) {
      updated = [...current];
      updated[existingIndex] = itemWithAlt;
    } else {
      updated = [itemWithAlt, ...current];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (e) {
    console.error("Failed to save category to storage:", e);
  }
}

export function deleteCategoryFromStorage(idOrSlug: string) {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomCategoriesFromStorage().filter(
      (c) => c.id !== idOrSlug && c.slug !== idOrSlug
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event(SYNC_EVENT));
  } catch (e) {
    console.error("Failed to delete category from storage:", e);
  }
}

/**
 * Hook to subscribe to live categories with immediate client hydration + background API synchronization
 */
export function useLiveCategories(typeFilter?: "clothing" | "accessory"): {
  categories: AtelierCategory[];
  clothing: AtelierCategory[];
  accessories: AtelierCategory[];
  isLoading: boolean;
  refresh: () => Promise<void>;
} {
  const [categories, setCategories] = useState<AtelierCategory[]>(() => {
    return [...DEFAULT_CLOTHING_CATEGORIES, ...DEFAULT_ACCESSORY_CATEGORIES];
  });
  const [isLoading, setIsLoading] = useState(true);

  const sync = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          // Sync custom ones into local storage
          const custom = data.categories.filter((c: AtelierCategory) => c.isCustom);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
            } catch {}
          }
          setCategories(data.categories);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to sync categories:", e);
    }
    setCategories(getAllCategories());
    setIsLoading(false);
  };

  useEffect(() => {
    // 1. Instant local render
    setCategories(getAllCategories());
    const t = setTimeout(() => setIsLoading(false), 300);

    // 2. Background sync
    sync();

    // 3. Re-sync on window focus or tab visibility change
    const handleVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        sync();
      }
    };

    // 4. Listen to local events
    const handleUpdate = () => {
      setCategories(getAllCategories());
    };

    window.addEventListener(SYNC_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", sync);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      clearTimeout(t);
      window.removeEventListener(SYNC_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", sync);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, []);

  const clothing = categories.filter((c) => c.type === "clothing");
  const accessories = categories.filter((c) => c.type === "accessory");

  const filtered = typeFilter ? categories.filter((c) => c.type === typeFilter) : categories;

  return {
    categories: filtered,
    clothing,
    accessories,
    isLoading,
    refresh: sync,
  };
}

