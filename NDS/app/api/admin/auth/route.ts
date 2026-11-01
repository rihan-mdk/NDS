import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "neels9589@gmail.com";
// Password is kept strictly server-side and never sent to client bundles
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Neels@2026";
const SESSION_COOKIE_NAME = "nds_admin_session";
const SESSION_SECRET_TOKEN = "nds_atelier_admin_token_v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Verify authorized admin credentials strictly on the server
    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, SESSION_SECRET_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          role: "admin",
          fullName: "Neel's Atelier Administrator",
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid administrator credentials" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (sessionCookie?.value === SESSION_SECRET_TOKEN) {
      return NextResponse.json({
        authenticated: true,
        user: {
          email: ADMIN_EMAIL,
          role: "admin",
          fullName: "Neel's Atelier Administrator",
        },
      });
    }

    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
