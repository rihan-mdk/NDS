import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { PRODUCTS, Product } from "@/lib/products-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "custom-products.json");
const SESSION_COOKIE_NAME = "nds_admin_session";
const SESSION_SECRET_TOKEN = "nds_atelier_admin_token_v1";

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf-8");
  }
}

function readCustomProductsFromFile(): Product[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    console.error("Error reading custom-products.json:", e);
    return [];
  }
}

function writeCustomProductsToFile(products: Product[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing custom-products.json:", e);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    categoryLabel: row.category_label || "",
    subCategory: row.sub_category || "",
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description || "",
    details: Array.isArray(row.details) ? row.details : [],
    fabric: row.fabric || "",
    embroidery: row.embroidery || "",
    washCare: row.wash_care || "",
    deliveryTime: row.delivery_time || "",
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    inStock: row.in_stock !== false,
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    isAccessory: Boolean(row.is_accessory),
  };
}

function productToRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    category: product.category,
    category_label: product.categoryLabel,
    sub_category: product.subCategory,
    price: product.price,
    original_price: product.originalPrice ?? null,
    images: product.images,
    description: product.description,
    details: product.details,
    fabric: product.fabric,
    embroidery: product.embroidery,
    wash_care: product.washCare,
    delivery_time: product.deliveryTime,
    sizes: product.sizes,
    in_stock: product.inStock,
    featured: product.featured ?? false,
    new_arrival: product.newArrival ?? false,
    is_accessory: product.isAccessory ?? false,
    updated_at: new Date().toISOString(),
  };
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === SESSION_SECRET_TOKEN;
}

// GET all products or single product by ?id= / ?slug= (Supabase + base catalog fallback)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetId = searchParams.get("id");
    const targetSlug = searchParams.get("slug");
    const identifier = targetId || targetSlug;

    const supabase = getSupabaseAdmin();

    if (supabase) {
      // 1. If looking for a specific product by ID or slug, query Supabase directly
      if (identifier) {
        const { data: singleRow, error: singleError } = await supabase
          .from("products")
          .select("*")
          .or(`id.eq.${identifier},slug.eq.${identifier}`)
          .maybeSingle();

        if (!singleError && singleRow) {
          const product = rowToProduct(singleRow);
          return NextResponse.json({ product, products: [product] });
        }
      }

      // 2. Fetch full catalog from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const custom = data.map(rowToProduct);
        const customIds = new Set(custom.map((p) => p.id));
        const base = PRODUCTS.filter((p) => !customIds.has(p.id));
        const all = [...custom, ...base];

        if (identifier) {
          const found = all.find((p) => p.id === identifier || p.slug === identifier);
          if (found) {
            return NextResponse.json({ product: found, products: [found] });
          }
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ products: all, customCount: custom.length });
      }
    }

    // Fallback to local file & base catalog
    const custom = readCustomProductsFromFile();
    const customIds = new Set(custom.map((p) => p.id));
    const base = PRODUCTS.filter((p) => !customIds.has(p.id));
    const all = [...custom, ...base];

    if (identifier) {
      const found = all.find((p) => p.id === identifier || p.slug === identifier);
      if (found) {
        return NextResponse.json({ product: found, products: [found] });
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ products: all, customCount: custom.length });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// POST create new product
export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      category,
      categoryLabel,
      subCategory,
      price,
      originalPrice,
      images,
      description,
      details,
      fabric,
      embroidery,
      washCare,
      deliveryTime,
      sizes,
      inStock,
      newArrival,
      isAccessory,
    } = body;

    if (!title || !category || price === undefined || !images?.length || !description) {
      return NextResponse.json(
        { error: "Required fields: title, category, price, at least one image, description" },
        { status: 400 }
      );
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let uniqueSlug = baseSlug;
    let counter = 1;
    const existingSlugs = new Set(PRODUCTS.map((p) => p.slug));

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: slugCheck } = await supabase.from("products").select("slug");
      if (slugCheck) {
        slugCheck.forEach((r) => existingSlugs.add(r.slug));
      }
    }

    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const newProduct: Product = {
      id: `prod-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: uniqueSlug,
      title: title.trim(),
      category,
      categoryLabel: categoryLabel || (isAccessory ? "Accessories" : "Collection"),
      subCategory: subCategory || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images: Array.isArray(images) ? images : [images],
      description: description.trim(),
      details: Array.isArray(details) ? details : [],
      fabric: fabric || (isAccessory ? "Fine Precious Metal" : "Pure Handloom Silk"),
      embroidery: embroidery || (isAccessory ? "Artisan Craftsmanship" : "Hand Needlework"),
      washCare: washCare || "Specialist Dry Clean Only",
      deliveryTime: deliveryTime || "Ships within 3-5 business days via Insured Express",
      sizes: Array.isArray(sizes) ? sizes : [],
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      newArrival: Boolean(newArrival),
      isAccessory: Boolean(isAccessory),
    };

    // 1. Save to Supabase if configured
    if (supabase) {
      const { error: insertError } = await supabase
        .from("products")
        .insert(productToRow(newProduct));

      if (insertError) {
        console.error("Supabase insert error:", insertError);
      }
    }

    // 2. Also save to local file for backup
    const fileCustom = readCustomProductsFromFile();
    fileCustom.unshift(newProduct);
    writeCustomProductsToFile(fileCustom);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PUT update existing product
export async function PUT(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let updatedProduct: Product | null = null;

    if (supabase) {
      const { data: existingRow } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (existingRow) {
        const merged = { ...rowToProduct(existingRow), ...body };
        await supabase.from("products").update(productToRow(merged)).eq("id", id);
        updatedProduct = merged;
      } else {
        // If not in Supabase yet, upsert full record
        const merged = { ...body };
        await supabase.from("products").upsert(productToRow(merged));
        updatedProduct = merged;
      }
    }

    // Update local file backup
    const custom = readCustomProductsFromFile();
    const existingIndex = custom.findIndex((p) => p.id === id);

    if (existingIndex > -1) {
      const merged: Product = updatedProduct || { ...custom[existingIndex], ...body };
      updatedProduct = merged;
      custom[existingIndex] = merged;
    } else {
      const baseProduct = PRODUCTS.find((p) => p.id === id);
      if (baseProduct) {
        const merged: Product = updatedProduct || { ...baseProduct, ...body };
        updatedProduct = merged;
        custom.unshift(merged);
        if (supabase) {
          await supabase.from("products").upsert(productToRow(merged));
        }
      }
    }

    writeCustomProductsToFile(custom);

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("products").delete().eq("id", id);
    }

    // Also remove from local file backup
    let custom = readCustomProductsFromFile();
    custom = custom.filter((p) => p.id !== id);
    writeCustomProductsToFile(custom);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
