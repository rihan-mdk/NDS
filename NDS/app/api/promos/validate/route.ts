import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Hardcoded fallback in case Supabase is unavailable
const FALLBACK_CODES: Record<string, { discountPercent: number; message: string }> = {
  ATELIER10: { discountPercent: 10, message: "10% Atelier Privé voucher applied." },
  NEELS10: { discountPercent: 10, message: "10% Neels voucher applied." },
  HERITAGE15: { discountPercent: 15, message: "15% Heritage Privé voucher applied." },
};

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "No code provided." }, { status: 400 });
    }

    const formatted = code.trim().toUpperCase();
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", formatted)
        .eq("is_active", true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .single();

      if (!error && data) {
        // Check max_uses
        if (data.max_uses !== null && data.usage_count >= data.max_uses) {
          return NextResponse.json({ valid: false, message: "This voucher has reached its usage limit." });
        }

        // Increment usage_count
        await supabase
          .from("promo_codes")
          .update({ usage_count: data.usage_count + 1 })
          .eq("id", data.id);

        return NextResponse.json({
          valid: true,
          discountPercent: data.discount_percent,
          message: data.description
            ? `${data.description} applied.`
            : `${data.discount_percent}% voucher applied.`,
        });
      }

      // Code not found in Supabase
      return NextResponse.json({ valid: false, message: "Invalid voucher or promotion code." });
    }

    // Supabase unavailable — use hardcoded fallback
    const fallback = FALLBACK_CODES[formatted];
    if (fallback) {
      return NextResponse.json({ valid: true, ...fallback });
    }

    return NextResponse.json({ valid: false, message: "Invalid voucher or promotion code." });
  } catch (err) {
    console.error("[promos/validate] error:", err);
    return NextResponse.json({ valid: false, message: "An error occurred. Please try again." }, { status: 500 });
  }
}

