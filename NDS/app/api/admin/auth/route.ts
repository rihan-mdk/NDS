import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_EMAIL,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(String(email), String(password));

    if (isValid) {
      const signedToken = await createAdminSessionToken(ADMIN_EMAIL);
      const cookieStore = await cookies();

      cookieStore.set(SESSION_COOKIE_NAME, signedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
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
      { error: "Invalid administrator credentials." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    const isAuthenticated = await verifyAdminSessionToken(sessionCookie?.value);

    if (isAuthenticated) {
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
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
