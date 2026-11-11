import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { PRODUCTS, Product } from "@/lib/products-data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminFromCookies } from "@/lib/auth-server";
import { sanitizeText, sanitizeHtml, sanitizeSlug } from "@/lib/security";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "custom-products.json");
const DELETED_FILE_PATH = path.join(DATA_DIR, "deleted-products.json");

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]), "utf-8");
  }
  if (!fs.existsSync(DELETED_FILE_PATH)) {
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

function readDeletedProductsFromFile(): string[] {
  try {
    ensureDataFile();
    if (!fs.existsSync(DELETED_FILE_PATH)) return [];
    const data = fs.readFileSync(DELETED_FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    return [];
  }
}

function writeDeletedProductsToFile(deletedIds: string[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(DELETED_FILE_PATH, JSON.stringify(deletedIds, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing deleted-products.json:", e);
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
  return verifyAdminFromCookies(cookieStore);
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
      // 1. Fetch full catalog from Supabase
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Detect tombstones (rows marked as deleted)
        const tombstoneRows = data.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any) => r.category === "deleted" || r.title === "__DELETED__" || r.slug?.startsWith("deleted-")
        );
        const serverDeletedIds = new Set(tombstoneRows.map((r) => r.id));

        const activeRows = data.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (r: any) => r.category !== "deleted" && r.title !== "__DELETED__" && !r.slug?.startsWith("deleted-") && r.category !== "__category__"
        );

        if (identifier) {
          if (serverDeletedIds.has(identifier)) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const foundRow = activeRows.find((r: any) => r.id === identifier || r.slug === identifier);
          if (foundRow) {
            const product = rowToProduct(foundRow);
            return NextResponse.json({ product, products: [product] });
          }
          const baseMatch = PRODUCTS.find((p) => (p.id === identifier || p.slug === identifier) && !serverDeletedIds.has(p.id));
          if (baseMatch) {
            return NextResponse.json({ product: baseMatch, products: [baseMatch] });
          }
          return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const custom = activeRows.map(rowToProduct);
        const customIds = new Set(custom.map((p) => p.id));
        const base = PRODUCTS.filter((p) => !customIds.has(p.id) && !serverDeletedIds.has(p.id));
        const all = [...custom, ...base];

        return NextResponse.json({
          products: all,
          customCount: custom.length,
          deletedIds: Array.from(serverDeletedIds),
        });
      }
    }

    // Fallback to local file & base catalog
    const custom = readCustomProductsFromFile();
    const localDeletedIds = new Set(readDeletedProductsFromFile());
    const customIds = new Set(custom.map((p) => p.id));
    const base = PRODUCTS.filter((p) => !customIds.has(p.id) && !localDeletedIds.has(p.id));
    const all = [...custom.filter((p) => !localDeletedIds.has(p.id)), ...base];

    if (identifier) {
      if (localDeletedIds.has(identifier)) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      const found = all.find((p) => p.id === identifier || p.slug === identifier);
      if (found) {
        return NextResponse.json({ product: found, products: [found] });
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      products: all,
      customCount: custom.length,
      deletedIds: Array.from(localDeletedIds),
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// POST create new product or sync deleted IDs
export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Support batch synchronization of deleted IDs into Supabase tombstones
    if (body.action === "sync-deleted" && Array.isArray(body.deletedIds)) {
      const supabase = getSupabaseAdmin();
      if (supabase && body.deletedIds.length > 0) {
        const tombstones = body.deletedIds.map((id: string) => ({
          id,
          slug: `deleted-${id}`,
          title: "__DELETED__",
          category: "deleted",
          category_label: "Deleted",
          sub_category: "Deleted",
          price: 0,
          images: [],
          description: "__DELETED__",
          in_stock: false,
          updated_at: new Date().toISOString(),
        }));
        await supabase.from("products").upsert(tombstones);
      }
      return NextResponse.json({ success: true, syncedCount: body.deletedIds.length });
    }

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
      title: sanitizeText(title.trim()),
      category: sanitizeSlug(category),
      categoryLabel: sanitizeText(categoryLabel || (isAccessory ? "Accessories" : "Collection")),
      subCategory: sanitizeText(subCategory || ""),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images: Array.isArray(images) ? images : [images],
      description: sanitizeHtml(description.trim()),
      details: Array.isArray(details) ? details.map((d: string) => sanitizeText(String(d))) : [],
      fabric: sanitizeText(fabric || (isAccessory ? "Fine Precious Metal" : "Pure Handloom Silk")),
      embroidery: sanitizeText(embroidery || (isAccessory ? "Artisan Craftsmanship" : "Hand Needlework")),
      washCare: sanitizeText(washCare || "Specialist Dry Clean Only"),
      deliveryTime: sanitizeText(deliveryTime || "Ships within 3-5 business days via Insured Express"),
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
      // 1. Delete standard row if it exists
      await supabase.from("products").delete().eq("id", id);

      // 2. Upsert tombstone row to guarantee this ID is permanently tracked as deleted across all devices
      await supabase.from("products").upsert({
        id,
        slug: `deleted-${id}`,
        title: "__DELETED__",
        category: "deleted",
        category_label: "Deleted",
        sub_category: "Deleted",
        price: 0,
        images: [],
        description: "__DELETED__",
        in_stock: false,
        updated_at: new Date().toISOString(),
      });
    }

    // Also remove from local file backup and record in deleted file
    let custom = readCustomProductsFromFile();
    custom = custom.filter((p) => p.id !== id);
    writeCustomProductsToFile(custom);

    const deleted = readDeletedProductsFromFile();
    if (!deleted.includes(id)) {
      deleted.push(id);
      writeDeletedProductsToFile(deleted);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
