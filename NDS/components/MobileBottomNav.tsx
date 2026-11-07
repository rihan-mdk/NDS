"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Sparkles, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Hide customer bottom nav on admin routes
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: LayoutGrid },
    { label: "Accessories", href: "/accessories", icon: Sparkles },
    { label: "Profile", href: "/account", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "/home";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FDFBF8]/96 backdrop-blur-md border-t border-[#EAE5DF] lg:hidden h-[94px] shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-start h-full pt-3 pb-[max(env(safe-area-inset-bottom,0px),16px)] px-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 transition-colors ${
                active
                  ? "text-[#191919] font-semibold"
                  : "text-[#9E9893] hover:text-[#191919]"
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] transition-all ${
                  active ? "scale-105 stroke-[2.2] text-[#191919]" : "stroke-[1.5]"
                }`}
              />
              <span className="text-[9px] uppercase tracking-widest leading-none font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
