"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FDFBF8]/96 backdrop-blur-md border-t border-[#EAE5DF] lg:hidden h-[90px] shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-full px-2 pb-[max(env(safe-area-inset-bottom,0px),10px)]">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center justify-center flex-1 h-[64px] select-none"
            >
              {active && (
                <motion.div
                  layoutId="activeBottomNavCircle"
                  className="absolute w-[64px] h-[56px] rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#EAE5DF]/80"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                    mass: 0.8,
                  }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? "scale-105 stroke-[2.2] text-[#191919]" : "stroke-[1.5] text-[#8C8681]"
                  }`}
                />
                <span
                  className={`text-[9px] uppercase tracking-wider leading-none transition-colors duration-200 ${
                    active ? "text-[#191919] font-bold" : "text-[#8C8681] font-medium"
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
