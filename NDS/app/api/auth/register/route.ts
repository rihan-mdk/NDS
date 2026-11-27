import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Registration service is currently unavailable. Please try again later." },
        { status: 500 }
      );
    }

    // Check if account already exists
    const { data: listData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const exists = listData?.users?.some((u) => u.email?.trim().toLowerCase() === email);
    if (exists) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in instead.", alreadyExists: true },
        { status: 400 }
      );
    }

    // Create user with email confirmed
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName || email.split("@")[0],
      },
    });

    if (createError || !createData?.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create account." },
        { status: 400 }
      );
    }

    // Automatically sign in to get an active session
    const { data: sessionData } = await admin.auth.signInWithPassword({
      email,
      password,
    });

    return NextResponse.json({
      user: createData.user,
      session: sessionData?.session || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
