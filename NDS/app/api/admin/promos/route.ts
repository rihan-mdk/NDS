import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminFromCookies } from "@/lib/auth-server";
import { sanitizeText, sanitizeSlug } from "@/lib/security";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return await verifyAdminFromCookies(cookieStore);
  } catch {
    return false;
  }
}

// GET — return all promo codes
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promos: data });
}

// POST — create new promo code
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { code, discount_percent, description, max_uses, expires_at } = body;

  if (!code || !discount_percent) {
    return NextResponse.json({ error: "code and discount_percent are required" }, { status: 400 });
  }

  // Sanitize inputs
  const safeCode = sanitizeSlug(String(code).trim().toUpperCase());
  const safeDescription = description ? sanitizeText(String(description)) : null;
  const discountNum = Number(discount_percent);

  if (!safeCode || isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
    return NextResponse.json({ error: "Invalid promo code or discount value" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: safeCode,
      discount_percent: discountNum,
      description: safeDescription,
      max_uses: max_uses ? Number(max_uses) : null,
      expires_at: expires_at || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promo: data }, { status: 201 });
}

// PUT — update promo code
export async function PUT(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Sanitize fields being updated
  if (updates.code) {
    updates.code = sanitizeSlug(String(updates.code).trim().toUpperCase());
  }
  if (updates.description) {
    updates.description = sanitizeText(String(updates.description));
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ promo: data });
}

// DELETE — delete promo code
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase.from("promo_codes").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
