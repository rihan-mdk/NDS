"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Sparkles, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FDFBF8]/95 backdrop-blur-md border-t border-[#EAE5DF] lg:hidden pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center h-12 px-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-10 transition-colors ${
                active
                  ? "text-[#191919] font-semibold"
                  : "text-[#77716D] hover:text-[#191919]"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform ${
                  active ? "scale-105 stroke-[2.2] text-[#191919]" : "stroke-[1.6]"
                }`}
              />
              <span className="text-[8px] uppercase tracking-wider leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
