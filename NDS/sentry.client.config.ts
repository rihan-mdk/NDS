// NDS Sentry Configuration
// This file is automatically loaded by @sentry/nextjs

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Performance monitoring — capture 10% of transactions in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay — 1% of sessions in production (10% on errors)
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 0.1,

  // Don't send errors in development
  enabled: process.env.NODE_ENV === "production",

  // Filter out noisy/known benign errors
  beforeSend(event) {
    // Don't report network errors from ad blockers or extensions
    if (event.exception?.values?.[0]?.type === "TypeError") {
      const msg = event.exception.values[0].value || "";
      if (
        msg.includes("Load failed") ||
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError")
      ) {
        return null;
      }
    }
    return event;
  },
});
