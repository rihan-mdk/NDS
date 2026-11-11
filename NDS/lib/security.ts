/**
 * Security & Sanitization Utilities for Neel's Designer Studio
 * Defends against XSS, Injection, Open Redirects, and Brute Force Attacks.
 */

// ── In-Memory Rate Limiter (sliding window per IP/key) ─────────────────────────
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

/**
 * Checks whether an action from a client identifier is within rate limits.
 * @param key Unique key, e.g. `${ip}:${action}`
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds Duration of the window in seconds
 * @returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: windowSeconds };
  }

  if (existing.count >= maxRequests) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  existing.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { allowed: true, remaining: maxRequests - existing.count, resetInSeconds };
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}

// ── XSS Sanitization ─────────────────────────────────────────────────────────

/**
 * Strips dangerous HTML tags, javascript: protocols, and event handlers
 * while preserving valid text content for luxury product descriptions.
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return "";
  let str = String(input);

  // Remove null bytes
  str = str.replace(/\0/g, "");

  // Escape dangerous HTML entities
  str = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  return str.trim();
}

/**
 * Sanitizes rich text descriptions but strips active script execution vectors
 */
export function sanitizeHtml(input: unknown): string {
  if (!input) return "";
  let str = String(input);

  // Strip script tags and content
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Strip iframe, object, embed, applet, form
  str = str.replace(/<\/?(iframe|object|embed|applet|form|base|meta|link)[^>]*>/gi, "");
  // Strip inline event handlers: onclick, onerror, onload, etc.
  str = str.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "");
  str = str.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  // Strip javascript: or data: URIs in href/src
  str = str.replace(/(href|src)\s*=\s*["']?\s*(javascript|data):[^"'>\s]*/gi, "");

  return str.trim();
}

/**
 * Sanitizes product slugs to only allow lowercase letters, numbers, and hyphens
 */
export function sanitizeSlug(input: string): string {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

/**
 * Validates redirect targets to prevent Open Redirect vulnerabilities.
 * Only allows relative paths starting with "/" and not "//".
 */
export function isSafeRedirect(target: string | null | undefined): boolean {
  if (!target) return false;
  const trimmed = target.trim();
  // Must start with a single slash and not double slashes (protocol-relative) or backslashes
  return (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  );
}

/**
 * Constant-time string comparison to defend against timing attacks on secret tokens.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const lenA = a.length;
  const lenB = b.length;
  let mismatch = lenA === lenB ? 0 : 1;
  const maxLen = Math.max(lenA, lenB);

  for (let i = 0; i < maxLen; i++) {
    const charA = i < lenA ? a.charCodeAt(i) : 0;
    const charB = i < lenB ? b.charCodeAt(i) : 0;
    mismatch |= charA ^ charB;
  }

  return mismatch === 0;
}

