import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  DEFAULT_CLOTHING_CATEGORIES,
  DEFAULT_ACCESSORY_CATEGORIES,
} from "@/lib/categories-store";
import { AtelierCategory } from "@/lib/products-data";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DATA_DIR = path.join(process.cwd(), "data");
const CATEGORIES_FILE_PATH = path.join(DATA_DIR, "custom-categories.json");

function readCustomCategoriesFromFile(): AtelierCategory[] {
  try {
    if (!fs.existsSync(CATEGORIES_FILE_PATH)) return [];
    const data = fs.readFileSync(CATEGORIES_FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    let customCategories: AtelierCategory[] = [];
    const productCounts: Record<string, number> = {};
    const discoveredFromProducts: Record<string, { name: string; type: "clothing" | "accessory"; image?: string }> = {};

    if (supabase) {
      // 1. Fetch custom categories from Supabase (category = '__category__')
      const { data: catRows, error: catError } = await supabase
        .from("products")
        .select("*")
        .eq("category", "__category__")
        .order("created_at", { ascending: false });

      if (!catError && Array.isArray(catRows)) {
        customCategories = catRows.map((row) => ({
          id: row.id,
          name: row.title,
          slug: row.slug,
          type: row.category_label === "accessory" ? "accessory" : "clothing",
          description: row.description || "",
          image:
            Array.isArray(row.images) && row.images.length > 0
              ? row.images[0]
              : row.category_label === "accessory"
              ? "/images/cover_images/clutches.jpg"
              : "/images/cover_images/short-kurti.png",
          alt: row.fabric || `Artisanal Handcrafted ${row.title}`,
          isCustom: true,
        }));
      }

      // 2. Fetch active products to count & auto-discover any categories used on products
      const { data: prods } = await supabase
        .from("products")
        .select("category, category_label, is_accessory, images, title")
        .neq("category", "__category__")
        .neq("category", "deleted");

      if (prods) {
        prods.forEach((p) => {
          if (p.category) {
            productCounts[p.category] = (productCounts[p.category] || 0) + 1;
            if (!discoveredFromProducts[p.category]) {
              const isAcc = Boolean(p.is_accessory) || p.category_label === "accessory" || ["bracelets", "clutches", "rings", "necklace"].includes(p.category);
              discoveredFromProducts[p.category] = {
                name: p.category_label || (p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, " ")),
                type: isAcc ? "accessory" : "clothing",
                image: Array.isArray(p.images) && p.images[0] ? p.images[0] : undefined,
              };
            }
          }
        });
      }
    }

    // Local file fallback if Supabase returned nothing
    if (customCategories.length === 0) {
      customCategories = readCustomCategoriesFromFile();
    }

    // Auto-synthesize any categories that have live products but lack an explicit category card
    const existingSlugs = new Set([
      ...customCategories.map((c) => c.slug),
      ...DEFAULT_CLOTHING_CATEGORIES.map((c) => c.slug),
      ...DEFAULT_ACCESSORY_CATEGORIES.map((c) => c.slug),
    ]);

    Object.entries(discoveredFromProducts).forEach(([slug, info]) => {
      if (!existingSlugs.has(slug)) {
        customCategories.push({
          id: `cat-${info.type}-${slug}`,
          name: info.name,
          slug,
          type: info.type,
          description: `${info.name} collection handcrafted with artisanal perfection.`,
          image: info.image || (info.type === "accessory" ? "/images/cover_images/Bracelet.jpg" : "/images/cover_images/short-kurti.png"),
          alt: `Artisanal Handcrafted ${info.name}`,
          isCustom: true,
        });
        existingSlugs.add(slug);
      }
    });

    const customSlugs = new Set(customCategories.map((c) => c.slug));

    // Clothing list
    const allClothing = [
      ...customCategories.filter((c) => c.type === "clothing"),
      ...DEFAULT_CLOTHING_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
    ].map((c) => ({
      ...c,
      count: productCounts[c.slug] ?? c.count ?? 0,
    }));

    // Accessories list
    const allAccessories = [
      ...customCategories.filter((c) => c.type === "accessory"),
      ...DEFAULT_ACCESSORY_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
    ].map((c) => ({
      ...c,
      count: productCounts[c.slug] ?? c.count ?? 0,
    }));

    const allCategories = [...allClothing, ...allAccessories];

    return NextResponse.json(
      {
        categories: allCategories,
        clothingCategories: allClothing,
        accessoryCategories: allAccessories,
        customCount: customCategories.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      {
        categories: [...DEFAULT_CLOTHING_CATEGORIES, ...DEFAULT_ACCESSORY_CATEGORIES],
        clothingCategories: DEFAULT_CLOTHING_CATEGORIES,
        accessoryCategories: DEFAULT_ACCESSORY_CATEGORIES,
      },
      { status: 200 }
    );
  }
}

