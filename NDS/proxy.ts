import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "./lib/auth-server";
import { checkRateLimit, getClientIp } from "./lib/security";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIp(request);

  // ── 1. Rate Limiting on Authentication & Sensitive Endpoints ───────────────
  if (pathname === "/api/admin/auth" && request.method === "POST") {
    const limit = checkRateLimit(`auth:${ip}`, 10, 60); // 10 attempts per minute
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Too many authentication attempts. Please wait 60 seconds before trying again.",
          retryAfter: limit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.resetInSeconds),
          },
        }
      );
    }
  }

  if (pathname === "/api/promos/validate" && request.method === "POST") {
    const limit = checkRateLimit(`promo:${ip}`, 20, 60); // 20 attempts per minute
    if (!limit.allowed) {
      return NextResponse.json(
        {
          valid: false,
          message: "Too many promo code attempts. Please wait a moment.",
        },
        { status: 429 }
      );
    }
  }

  // ── 2. Admin UI Routes Protection (/admin, /admin/*) ───────────────────────
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isValidAdmin = await verifyAdminSessionToken(sessionToken);

    if (!isValidAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 3. Admin API Routes Protection (/api/admin/* except /api/admin/auth) ──
  // Note: GET /api/admin/products and GET /api/admin/categories also support public store catalog loading.
  // Sensitive write methods (POST, PUT, DELETE) and admin-only endpoints (roles, upload, admin orders list) are restricted.
  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/auth") {
    const isWrite = ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);
    const isAdminOnlyRoute =
      pathname.startsWith("/api/admin/roles") ||
      pathname.startsWith("/api/admin/upload") ||
      pathname.startsWith("/api/admin/promos");

    if (isWrite || isAdminOnlyRoute) {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const isValidAdmin = await verifyAdminSessionToken(sessionToken);

      if (!isValidAdmin) {
        return NextResponse.json(
          { error: "Unauthorized atelier administrator access required." },
          { status: 401 }
        );
      }
    }
  }

  // ── 4. Apply Hardened Security Headers to All Responses ────────────────────
  const isDev = process.env.NODE_ENV === "development";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com https://images.unsplash.com https://cdn.21st.dev https://placehold.co https://*.supabase.co https://pqlmjejlgtvnuuiwllre.supabase.co",
    "connect-src 'self' https://*.supabase.co https://pqlmjejlgtvnuuiwllre.supabase.co https://accounts.google.com",
    "frame-src https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    !isDev ? "upgrade-insecure-requests" : "",
  ].filter(Boolean);

  const cspHeader = cspDirectives.join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Apply Content Security Policy
  response.headers.set("Content-Security-Policy", cspHeader);

  // Prevent MIME-sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // Cross-Site Scripting Protection (legacy fallback)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Strict Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Disable dangerous browser permissions
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  // Strict Transport Security (HSTS - 2 years)
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, fonts)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/|fonts/).*)",
  ],
};

