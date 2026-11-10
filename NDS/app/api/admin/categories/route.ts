import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  DEFAULT_CLOTHING_CATEGORIES,
  DEFAULT_ACCESSORY_CATEGORIES,
} from "@/lib/categories-store";
import { AtelierCategory } from "@/lib/products-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DATA_DIR = path.join(process.cwd(), "data");
const CATEGORIES_FILE_PATH = path.join(DATA_DIR, "custom-categories.json");
const SESSION_COOKIE_NAME = "nds_admin_session";
const SESSION_SECRET_TOKEN = "nds_atelier_admin_token_v1";

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CATEGORIES_FILE_PATH)) {
    fs.writeFileSync(CATEGORIES_FILE_PATH, JSON.stringify([]), "utf-8");
  }
}

function readCustomCategoriesFromFile(): AtelierCategory[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(CATEGORIES_FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    console.error("Error reading custom-categories.json:", e);
    return [];
  }
}

function writeCustomCategoriesToFile(categories: AtelierCategory[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(CATEGORIES_FILE_PATH, JSON.stringify(categories, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing custom-categories.json:", e);
  }
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value === SESSION_SECRET_TOKEN;
  } catch {
    return false;
  }
}

// GET all categories (Clothing + Accessories, with live product counts)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    let customCategories: AtelierCategory[] = [];

    // 1. Fetch custom categories from Supabase products table (category = '__category__')
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "__category__")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        customCategories = data.map((row) => ({
          id: row.id,
          name: row.title,
          slug: row.slug,
          type: row.category_label === "accessory" ? "accessory" : "clothing",
          description: row.description || "",
          image:
            Array.isArray(row.images) && row.images.length > 0
              ? row.images[0]
              : "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
          alt: row.fabric || `Artisanal Handcrafted ${row.title}`,
          isCustom: true,
        }));
      }
    }

    // Fallback to local file backup if database empty or offline
    if (customCategories.length === 0) {
      customCategories = readCustomCategoriesFromFile();
    }

    // 2. Fetch live product counts per category
    const productCounts: Record<string, number> = {};
    if (supabase) {
      const { data: prods } = await supabase
        .from("products")
        .select("category")
        .neq("category", "__category__")
        .neq("category", "deleted");

      if (prods) {
        prods.forEach((p) => {
          if (p.category) {
            productCounts[p.category] = (productCounts[p.category] || 0) + 1;
          }
        });
      }
    }

    // Merge default + custom
    const customSlugs = new Set(customCategories.map((c) => c.slug));
    const allClothing = [
      ...customCategories.filter((c) => c.type === "clothing"),
      ...DEFAULT_CLOTHING_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
    ].map((c) => ({
      ...c,
      count: productCounts[c.slug] ?? c.count ?? 0,
    }));

    const allAccessories = [
      ...customCategories.filter((c) => c.type === "accessory"),
      ...DEFAULT_ACCESSORY_CATEGORIES.filter((c) => !customSlugs.has(c.slug)),
    ].map((c) => ({
      ...c,
      count: productCounts[c.slug] ?? c.count ?? 0,
    }));

    const allCategories = [...allClothing, ...allAccessories];

    return NextResponse.json({
      categories: allCategories,
      clothingCategories: allClothing,
      accessoryCategories: allAccessories,
      customCount: customCategories.length,
    });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

// POST create new category (separate for clothing and accessories)
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type = "clothing", description = "", image = "", slug: customSlug } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    if (type !== "clothing" && type !== "accessory") {
      return NextResponse.json(
        { error: "Invalid type. Must be 'clothing' or 'accessory'" },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const baseSlug = (customSlug || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const categoryId = `cat-${type}-${baseSlug}-${Date.now().toString().slice(-4)}`;

    const fallbackImage =
      type === "clothing"
        ? "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
        : "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80";

    const newCategory: AtelierCategory = {
      id: categoryId,
      name: cleanName,
      slug: baseSlug,
      type,
      description: description.trim() || `${cleanName} collection crafted for the discerning atelier.`,
      image: image.trim() || fallbackImage,
      alt: `Artisanal Handcrafted ${cleanName}`,
      count: 0,
      isCustom: true,
    };

    // 1. Save to Supabase (using products table with category = '__category__')
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: insertError } = await supabase.from("products").upsert({
        id: newCategory.id,
        slug: newCategory.slug,
        title: newCategory.name,
        category: "__category__",
        category_label: newCategory.type,
        sub_category: newCategory.type === "accessory" ? "Accessory Category" : "Clothing Category",
        price: 0,
        images: [newCategory.image],
        description: newCategory.description,
        fabric: newCategory.alt,
        in_stock: true,
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Supabase category insert error:", insertError);
      }
    }

    // 2. Also save to local file backup
    const fileCategories = readCustomCategoriesFromFile();
    // Replace if exists, or prepend
    const existingIdx = fileCategories.findIndex((c) => c.slug === newCategory.slug);
    if (existingIdx > -1) {
      fileCategories[existingIdx] = newCategory;
    } else {
      fileCategories.unshift(newCategory);
    }
    writeCustomCategoriesToFile(fileCategories);

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json({ error: "Category ID or slug is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      if (id) {
        await supabase.from("products").delete().eq("id", id).eq("category", "__category__");
      }
      if (slug) {
        await supabase.from("products").delete().eq("slug", slug).eq("category", "__category__");
      }
    }

    // Remove from local file
    let fileCategories = readCustomCategoriesFromFile();
    fileCategories = fileCategories.filter(
      (c) => (id ? c.id !== id : true) && (slug ? c.slug !== slug : true)
    );
    writeCustomCategoriesToFile(fileCategories);

    return NextResponse.json({ success: true, deleted: id || slug });
  } catch (error) {
    console.error("DELETE /api/admin/categories error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

