import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SESSION_COOKIE_NAME = "nds_admin_session";
const SESSION_SECRET_TOKEN = "nds_atelier_admin_token_v1";

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value === SESSION_SECRET_TOKEN;
  } catch {
    return false;
  }
}

// ── GET ── List all users with their roles (admin only)
export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ users: [] }, { status: 200 });
  }

  try {
    // Fetch all auth users via admin API
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.error("Error listing users:", usersError);
      return NextResponse.json({ users: [] });
    }

    // Fetch all roles
    const { data: rolesData } = await supabase.from("user_roles").select("*");
    const roleMap: Record<string, string> = {};
    for (const r of rolesData || []) {
      roleMap[r.user_id] = r.role;
    }

    const enriched = users.map((u) => ({
      id: u.id,
      email: u.email || "",
      fullName: u.user_metadata?.full_name || u.user_metadata?.name || "",
      role: roleMap[u.id] || "customer",
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at || null,
    }));

    return NextResponse.json({ users: enriched });
  } catch (err) {
    console.error("GET /api/admin/roles error:", err);
    return NextResponse.json({ users: [] }, { status: 200 });
  }
}

// ── PUT ── Assign/update a role for a user (admin only)
export async function PUT(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    const validRoles = ["customer", "staff", "admin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { error } = await supabase.from("user_roles").upsert({
      user_id: userId,
      role,
      assigned_by: "admin",
      assigned_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating role:", error);
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/admin/roles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE ── Remove a user's role (reset to customer)
export async function DELETE(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Reset to customer (don't delete row, just update role)
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "customer", assigned_by: "admin" });

    if (error) {
      return NextResponse.json({ error: "Failed to reset role" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/admin/roles error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

