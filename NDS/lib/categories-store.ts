"use client";

import { useEffect, useState } from "react";
import { AtelierCategory, CATEGORIES_LIST, ACCESSORIES_CATEGORIES } from "@/lib/products-data";

export const DEFAULT_CLOTHING_CATEGORIES: AtelierCategory[] = [
  {
    id: "cat-cloth-korean",
    slug: "korean",
    name: "Korean",
    type: "clothing",
    description: "Crisp architectural lines, airy neutral linens, and understated luxury.",
    image: "/images/cover_images/korean.png",
    alt: "Korean Minimalist Contemporary Tailoring",
    isCustom: false,
  },
  {
    id: "cat-cloth-short-kurti",
    slug: "short-kurti",
    name: "Short Kurti",
    type: "clothing",
    description: "Bespoke handloom kurtis adorned with zari needlework and floral lacework.",
    image: "/images/cover_images/short-kurti.png",
    alt: "Artisanal Handloom Short Kurti with Contemporary Needlework",
    isCustom: false,
  },
  {
    id: "cat-cloth-pakistani",
    slug: "pakistani",
    name: "Pakistani",
    type: "clothing",
    description: "Floor-length flared kalis with intricate resham floss and delicate shadow work.",
    image: "/images/cover_images/pakistani.jpg",
    alt: "Flowing Luxury Pakistani Lawn & Raw Silk Ensemble",
    isCustom: false,
  },
  {
    id: "cat-cloth-lehenga",
    slug: "lehenga",
    name: "Lehenga",
    type: "clothing",
    description: "Handcrafted bridal & festive imperial silhouettes featuring zardozi and antique tilla.",
    image: "/images/cover_images/Lehenga.png",
    alt: "High Couture Handcrafted Bridal & Festive Lehenga",
    isCustom: false,
  },
  {
    id: "cat-cloth-gown",
    slug: "gown",
    name: "Gown",
    type: "clothing",
    description: "Sculptural drapery, matka silk weaves, and fluid contemporary luxury.",
    image: "/images/cover_images/gown.png",
    alt: "Sculptural Architectural Evening Gown",
    isCustom: false,
  },
  {
    id: "cat-cloth-party-wear",
    slug: "party-wear",
    name: "Party Wear",
    type: "clothing",
    description: "Lustrous metallic accents, crystal embellishments, and evening glamour.",
    image: "/images/cover_images/party-wear.png",
    alt: "Statement Evening Party Wear Couture",
    isCustom: false,
  },
  {
    id: "cat-cloth-co-ord-set",
    slug: "co-ord-set",
    name: "Co-ord Set",
    type: "clothing",
    description: "Monochromatic structured separates crafted from breathable pure silks.",
    image: "/images/cover_images/co-ord-set.jpg",
    alt: "Modern Raw Silk Coordinated Atelier Set",
    isCustom: false,
  },
  {
    id: "cat-cloth-jeans",
    slug: "jeans",
    name: "Jeans",
    type: "clothing",
    description: "Premium Japanese selvedge denim tailored with subtle heritage bullion motifs.",
    image: "/images/cover_images/jeans.png",
    alt: "Artisan Handcrafted Tailored Selvedge Denim",
    isCustom: false,
  },
];

export const DEFAULT_ACCESSORY_CATEGORIES: AtelierCategory[] = [
  {
    id: "cat-acc-bracelets",
    slug: "bracelets",
    name: "Bracelet",
    type: "accessory",
    description: "Filigree heritage cuffs, 22k gold foiling, and meenakari craftsmanship.",
    image: "/images/cover_images/Bracelet.jpg",
    alt: "Artisanal Heritage Cuffs & Bracelets",
    isCustom: false,
  },
  {
    id: "cat-acc-clutches",
    slug: "clutches",
    name: "Clutches",
    type: "accessory",
    description: "Hand-sewn velvet potlis with bullion wire cord and pearl tassels.",
    image: "/images/cover_images/clutches.jpg",
    alt: "Luxury Raw Silk & Velvet Potli Clutches",
    isCustom: false,
  },
  {
    id: "cat-acc-rings",
    slug: "rings",
    name: "Rings",
    type: "accessory",
    description: "Uncut polki diamonds set in royal kundan foil mounts.",
    image: "/images/cover_images/rings.jpg",
    alt: "Imperial Kundan & Polki Statement Rings",
    isCustom: false,
  },
];

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
  refresh: () => Promise<void>;
} {
  const [categories, setCategories] = useState<AtelierCategory[]>(() => {
    return getAllCategories();
  });

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
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to sync categories:", e);
    }
    setCategories(getAllCategories());
  };

  useEffect(() => {
    // 1. Instant local render
    setCategories(getAllCategories());

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
    refresh: sync,
  };
}

