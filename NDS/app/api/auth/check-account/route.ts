import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ exists: false });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ exists: false });
    }

    // List users from Supabase Auth admin API to verify if email exists
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error || !data?.users) {
      return NextResponse.json({ exists: false });
    }

    const found = data.users.some(
      (u) => u.email?.trim().toLowerCase() === email
    );

    return NextResponse.json({ exists: found });
  } catch {
    return NextResponse.json({ exists: false });
  }
}
