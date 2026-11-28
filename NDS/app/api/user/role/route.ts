import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  createAdminSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-server";

// GET /api/user/role?userId=<uuid>
// Checks the user's role in user_roles table only for the authenticated session.
// Issues a signed admin session cookie only if the authenticated caller has the "admin" role.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  try {
    // Authenticate the caller session first
    const supabaseServer = await createClient();
    let {
      data: { user },
    } = await supabaseServer.auth.getUser();

    // Also support Authorization header Bearer token
    if (!user) {
      const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        const tokenRes = await supabaseServer.auth.getUser(token);
        if (tokenRes.data?.user) {
          user = tokenRes.data.user;
        }
      }
    }

    // If caller is not authenticated, deny role elevation
    if (!user) {
      return NextResponse.json({ role: "customer" });
    }

    // Caller can only query their own role
    if (requestedUserId && requestedUserId !== user.id) {
      return NextResponse.json({ role: "customer" });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ role: "customer" });
    }

    const { data } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const role = data?.role || "customer";

    // If verified user has admin role in database, issue signed HMAC session token
    if (role === "admin") {
      const token = await createAdminSessionToken(user.email || undefined);
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
