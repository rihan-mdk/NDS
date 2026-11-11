import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  createAdminSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-server";

// GET /api/user/role?userId=<uuid>
// Checks the user's role in user_roles table.
// If they have the "admin" role, issues a signed admin session cookie.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ role: "customer" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ role: "customer" });
  }

  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    const role = data?.role || "customer";

    // If this user has admin role, issue a signed HMAC session token
    if (role === "admin") {
      const token = await createAdminSessionToken();
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
    }

    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ role: "customer" });
  }
}
