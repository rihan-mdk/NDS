/**
 * Server-Side Authentication & Session Verification Helper
 * Built with Web Crypto API for compatibility across Next.js Edge Middleware and Node.js Route Handlers.
 */

import { timingSafeCompare } from "./security";

export const ADMIN_EMAIL = "neels9589@gmail.com";
export const SESSION_COOKIE_NAME = "nds_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set. Add it to .env.local and your deployment environment."
    );
  }
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

export interface AdminSessionPayload {
  role: "admin";
  email: string;
  iat: number;
  exp: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export async function createAdminSessionToken(email: string = ADMIN_EMAIL): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    role: "admin",
    email,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };

  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const secret = getSigningSecret();
  const signature = await hmacSign(payloadB64, secret);

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token.
 * Returns true only if the signature is authentic and the token has not expired.
 */
export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, providedSig] = parts;

  try {
    const secret = getSigningSecret();
    const expectedSig = await hmacSign(payloadB64, secret);

    if (!timingSafeCompare(providedSig, expectedSig)) {
      return false;
    }

    const payloadBytes = base64UrlToBytes(payloadB64);
    const jsonStr = new TextDecoder().decode(payloadBytes);
    const payload: AdminSessionPayload = JSON.parse(jsonStr);

    if (payload.role !== "admin") return false;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies admin session from cookie store (compatible with Route Handlers)
 */
export async function verifyAdminFromCookies(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): Promise<boolean> {
  try {
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return await verifyAdminSessionToken(sessionCookie.value);
  } catch {
    return false;
  }
}

/**
 * Validates admin credentials using timing-safe constant time comparison.
 */
export function verifyAdminCredentials(emailInput: string, passwordInput: string): boolean {
  const normalizedEmail = (emailInput || "").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "Neels@2026";

  const emailMatches = timingSafeCompare(normalizedEmail, ADMIN_EMAIL);
  const passwordMatches = timingSafeCompare(passwordInput || "", expectedPassword);

  return emailMatches && passwordMatches;
}

