import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { PRODUCTS, Product } from "@/lib/products-data";

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

function readCustomProducts(): Product[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data || "[]");
  } catch (e) {
    console.error("Error reading custom-products.json:", e);
    return [];
  }
}

function writeCustomProducts(products: Product[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(FILE_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing custom-products.json:", e);
  }
}

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === SESSION_SECRET_TOKEN;
}

// GET all products (base + custom overrides)
export async function GET() {
  try {
    const custom = readCustomProducts();
    const customIds = new Set(custom.map((p) => p.id));
    // Base products excluding any that have custom overrides
    const base = PRODUCTS.filter((p) => !customIds.has(p.id));
    const all = [...custom, ...base];
    return NextResponse.json({ products: all, customCount: custom.length });
  } catch (error) {
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

    const custom = readCustomProducts();
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    let uniqueSlug = baseSlug;
    let counter = 1;
    const existingSlugs = new Set([...PRODUCTS, ...custom].map((p) => p.slug));
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

    custom.unshift(newProduct);
    writeCustomProducts(custom);

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

    const custom = readCustomProducts();
    const existingIndex = custom.findIndex((p) => p.id === id);

    let updatedProduct: Product;
    if (existingIndex > -1) {
      updatedProduct = { ...custom[existingIndex], ...body };
      custom[existingIndex] = updatedProduct;
    } else {
      // If it was a base product being edited for the first time
      const baseProduct = PRODUCTS.find((p) => p.id === id);
      if (!baseProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      updatedProduct = { ...baseProduct, ...body };
      custom.unshift(updatedProduct);
    }

    writeCustomProducts(custom);
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

    let custom = readCustomProducts();
    // Filter out of custom
    custom = custom.filter((p) => p.id !== id);
    writeCustomProducts(custom);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
