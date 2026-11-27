"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  resetSignal?: number;
}

export function TurnstileWidget({
  onSuccess,
  onExpire,
  onError,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = () => {
    if (
      typeof window === "undefined" ||
      !(window as any).turnstile ||
      !containerRef.current ||
      !siteKey
    ) {
      return false;
    }

    // Clean up existing widget first if already rendered
    if (widgetIdRef.current) {
      try {
        (window as any).turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      containerRef.current.innerHTML = "";
      const id = (window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onSuccess(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": () => {
          onError?.();
        },
        theme: "light",
        size: "flexible",
      });
      widgetIdRef.current = id;
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!siteKey) return;

    if (!renderWidget()) {
      const interval = setInterval(() => {
        if (renderWidget()) {
          clearInterval(interval);
        }
      }, 150);
      const timeout = setTimeout(() => clearInterval(interval), 6000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && (window as any).turnstile) {
      try {
        (window as any).turnstile.reset(widgetIdRef.current);
      } catch {
        renderWidget();
      }
    }
  }, [resetSignal]);

  if (!siteKey) return null;

  return (
    <div className="w-full min-h-[65px] flex justify-center items-center my-1.5">
      <div ref={containerRef} className="w-full flex justify-center" />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          renderWidget();
        }}
      />
    </div>
  );
}
