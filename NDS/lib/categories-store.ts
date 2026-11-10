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
    name: "Bracelet & Cuffs",
    type: "accessory",
    description: "Filigree heritage cuffs, 22k gold foiling, and meenakari craftsmanship.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQd_Bl8-29VL_EkcAAe3uI4Mx5aTxlzLLbaDPU4N7hBLurX7il5yqNe52gPYHGos9P-nXlZFWbccr6VHXBBmSHGDf7h2E7Xl759UGAOpW1SGiKeCf46YRWigV_A4UZlEnF5qss3WS4vUW9WzEGspnDetazXHuy1jlQRGAqUCHcDBmBHN47hc0UT2ttRsCqnj28cn4INi87FSavEb9eZ8LZcqUqiRhbVUnDnt9gzBgM",
    isCustom: false,
  },
  {
    id: "cat-acc-clutches",
    slug: "clutches",
    name: "Clutches & Potlis",
    type: "accessory",
    description: "Hand-sewn velvet potlis with bullion wire cord and pearl tassels.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBg4fEf5pO9178NLlTyF2p2U0sUBWW4zY3gJh1_88s9j8HmpLQiY6jT44friUru7ejw2P8cdcRuyeNxISzQm56fs_P9m7IIyp3rOV_t-NsOnPF7idSQlYkFYT6pJDlXfSnw8dZSqs9qrsOdghNfhCSo_lH69f3fTkkJSrXLurEz3KQZwCTikLlD2HJMQqBQThgWK2FY9_BDFlVW1F7rIIpmSFLWMuk-F4QjJkVWiUR8",
    isCustom: false,
  },
  {
    id: "cat-acc-rings",
    slug: "rings",
    name: "Statement Rings",
    type: "accessory",
    description: "Uncut polki diamonds set in royal kundan foil mounts.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvk8J6o7zxSCxL0DNrDShrTtnmHzoBCNVDp1mhNa6ehWAzo2TusQ-oM5r6wh3jEGRFWJjVgNcG1wTeSA9MIiIFKESLGwkEtS1bbgQdXiRefG2nGneDCUTIiEghgVFqq7dpP_Fz1QA-1bU7aZQGQJFfYo7qhp3EKQ4ywU0vrAOAs3fWRF4YPJcAj61W5KS4cqmUGkofisrtQm7DRuvP61f_PusGAragBx_DVLS1ie3z",
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
      const res = await fetch("/api/admin/categories");
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
    } catch {}
    setCategories(getAllCategories());
  };

  useEffect(() => {
    // 1. Instant local render
    setCategories(getAllCategories());

    // 2. Background sync
    sync();

    // 3. Listen to local events
    const handleUpdate = () => {
      setCategories(getAllCategories());
    };

    window.addEventListener(SYNC_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
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

