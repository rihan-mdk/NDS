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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCs_Gk-skZmje9I1LA2f8zF6jADX9iGDImEuiVJwQ2IWnUok1lXO91QA2bnOx84rPoG4FElPAAm4t8_neikL9V0BCdd-FFKAnkox4dKehGDq-upI1jJLjiGavUjUuOAT56AfflSrAdxEsbFJXBiG_QULGC1A99kUUkhqHOxXft0LUfQLOw_pvcjqhRMxqQolC2fRgir7mnIa0Zn7ymNgfLUtsNn-8IysngfaN39RSaL",
    isCustom: false,
  },
  {
    id: "cat-cloth-short-kurti",
    slug: "short-kurti",
    name: "Short Kurti",
    type: "clothing",
    description: "Bespoke handloom kurtis adorned with zari needlework and floral lacework.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa7YtcMTAGCoRTMGeM2MQ4PPSUE3nY0ndT95g079HbkTfqGHcvSmi2i5uosF3JpeEts49lsQtMrSjOn5DAwxYy_PCocNB9ztqPFEzu18u7ENCJR4nJ2Vr-ZcwGUPmOZlDbsNyVHMrOm7tIHBrS4gi0yg7PSuIg6enaBTquUSZ4lzLI6Kae9YyaZcuXI15higHIEI1hrCpamHkqfR6lIDaJNopFMnY5lO6Z4GGzX-qA",
    isCustom: false,
  },
  {
    id: "cat-cloth-pakistani",
    slug: "pakistani",
    name: "Pakistani",
    type: "clothing",
    description: "Floor-length flared kalis with intricate resham floss and delicate shadow work.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdgqTEm_9UhQYsscfcIk5TC3NnKJykm_Ts_dURhq_mGOLyICtEqNPHQxJAi1m1a5LKUydjuTLP1JSnz8p6ch7yH7L9si-nUYedb889I-t14RHG7HAchdaSXgg6LTBGzjH3c7Gqajy4oLeQKJTOQK0PLXpDPBFKDEJ593uwCeU2cNf0V0ThIBd4uq3VsDWkU34dOy6IXQPUxKZCa3cnYN3K0jtitWqnAyWzbx3SGynJ",
    isCustom: false,
  },
  {
    id: "cat-cloth-lehenga",
    slug: "lehenga",
    name: "Lehenga",
    type: "clothing",
    description: "Handcrafted bridal & festive imperial silhouettes featuring zardozi and antique tilla.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDZB1C1b4wIsUj3r9TJv0bP2nAQsOIjfm9ExraVyeejU1laqBIbigB_0OeP0raLA2BbbBkfuGpsYIArl6b0t6_V14eSXlW0uq7iGZGFoo04S69k_Bwu_zJIB1nLrnXSi-hdHF__CsnKvIDEjwxJfY0S-0DYemri-iq3cj1Xe2rlLN3RalnNcy89Rk_oLIhptPJW5nMO-jCcyVfBsREBz8bImhLH6s_ow1u9uuAoT0V",
    isCustom: false,
  },
  {
    id: "cat-cloth-gown",
    slug: "gown",
    name: "Gown",
    type: "clothing",
    description: "Sculptural drapery, matka silk weaves, and fluid contemporary luxury.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCM05KT-wr6KIy61aaOgK_a90RWm1eazWi0XDmU5tZSfAtwABYYv92--MI0krKPApZNgT2ydHKBr9RCxMgOj8EneI9k8EGbTtCmChCGhLwpngkv_Og2E-3tKMBCQvEg77LO2nV-eWGEmD45q9BhjlvWE_MzRR78aShCNdkeP2aOx8Dp619o4QPKmQGdRyUuTzT_umhv3_8yFbZieBmuvl_-WYU-CnwrrZg-0ZNvWxUS",
    isCustom: false,
  },
  {
    id: "cat-cloth-party-wear",
    slug: "party-wear",
    name: "Party Wear",
    type: "clothing",
    description: "Lustrous metallic accents, crystal embellishments, and evening glamour.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdT-xNFUh3RpOCVGpofbw1KlVAhvmNDnh2HC7GmuCaOFKOVydhmwa3apm9UBEdCdQVlzjxyUfp8Q5u27cDyl0wCKPNjg_krM_DX4pLF90B_ANu6-GBlP96cIdWTgzzJ3o2Mw2_JQJBXEjOoGkXdFl5P1e4C-l6tasRoIbdflvwubcJC2TZHVZW3SSD0xcJl_KkL6E2H12E8mzXYWB461qxciLPuRz1Tt_jsKVZZvp4",
    isCustom: false,
  },
  {
    id: "cat-cloth-co-ord-set",
    slug: "co-ord-set",
    name: "Co-ord Set",
    type: "clothing",
    description: "Monochromatic structured separates crafted from breathable pure silks.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuCbc88grQ4WV9P3FZO9jCY7gApELjwc9GndpjzkAC0DrwZBuI-25wyYP_fNe_WLOZv0ufYmTTISRM520z-MyQ6YP9BIw7p6I-JXUSy_tKqbaEo7C_3LH5FPJ7PV50avI8gfc5gs5O_ce4o5IFJc2k5ZDFP3E1Np2Xxk0YEZquobWwlQBDgc01gRSQSIMPAPFbDLpckhuOXuRA5L7w3bCLeVg-EWbYRPHdzKFBNVUc",
    isCustom: false,
  },
  {
    id: "cat-cloth-jeans",
    slug: "jeans",
    name: "Jeans",
    type: "clothing",
    description: "Premium Japanese selvedge denim tailored with subtle heritage bullion motifs.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABqG1V_7BzODuslTpgTHl6ju_8nWtiLu9RQgrb7uESTr0quwlr2lGdVWg5lTla0zXtyO5xqr3Pd7LNB5IqJy_9hErkdycWrEsbSVgnAdIILYYY7uOBXuTe0de8J6yQCychEztGm_Z2Gr14wfwZuOVgNs32lr5BSs_sAtNhNCv3gAKN5J3l_BNohzHB5U5sbY7GDWlwsJ5FxAziMJ_j1LHHDbBAssbJOGDzHc-Edllg",
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

