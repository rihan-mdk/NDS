"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Search, Heart, ShoppingBag, User as UserIcon } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const isActive = (path: string) => {
    if (path === "/" || path === "/home") {
      return pathname === "/" || pathname === "/home";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "CATEGORIES", href: "/categories" },
    { name: "ACCESSORIES", href: "/accessories" },
    { name: "ABOUT US", href: "/about" },
    ...(isAdmin ? [{ name: "ADMIN", href: "/admin" }] : []),
  ];

  const LOGO_SRC =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD-qvxpcDQDfN_hyWQSp6-axmw-zI6r2sMCopsEWgMwpIW1l836LYw7eAjJWhvz_9qzv6HS_CYwQ6okK4KCNrUr1R1rLTPmWuHP0V5eeA7ghrQy0yroXhdqfhaFMmarcYYrpw0hkCnxf6Mrbs-dInUqYYJC5okwFDHRylOMXiQ_EsdReVkrGmUqjoD5-ieEQXAmzsEEpxCubZsb9rVtvJcivrnJz3WWK-wiwte35kbh2kuw96_4UkuKtA";

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FDFBF8]/95 backdrop-blur-md border-b border-[#EAE5DF] transition-all">
      <div className="h-14 w-full px-4 sm:px-10 lg:px-14 flex items-center justify-between">

        {/* ── LEFT: Logo ── */}
        <div className="flex items-center">
          <Link
            href="/"
            className="uppercase tracking-[0.2em] text-[#191919] transition-opacity hover:opacity-85 flex items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="NEEL'S DESIGNER STUDIO Logo"
              style={{ filter: "brightness(0)", height: "26px", width: "auto", objectFit: "contain" }}
              className="block sm:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_SRC}
              alt="NEEL'S DESIGNER STUDIO Logo"
              style={{ filter: "brightness(0)", height: "28px", width: "auto", objectFit: "contain" }}
              className="hidden sm:block"
            />
          </Link>
        </div>

        {/* ── CENTER: Nav links (desktop only) ── */}
        <nav className="hidden lg:flex items-center justify-center space-x-10">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] tracking-[0.22em] uppercase transition-colors relative py-1 ${
                  active
                    ? "text-[#191919] font-medium after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#191919]"
                    : "text-[#77716D] hover:text-[#191919] font-normal"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* ── RIGHT: Action icons (Search, Wishlist, Bag) ── */}
        <div className="flex items-center space-x-3.5 sm:space-x-5">
          {/* Search — always visible */}
          <Link
            href="/search"
            aria-label="Search"
            className="text-[#77716D] hover:text-[#191919] transition-colors p-1"
          >
            <Search className="w-[18px] h-[18px] sm:w-4 sm:h-4 stroke-[1.6]" />
          </Link>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative text-[#77716D] hover:text-[#191919] transition-colors p-1"
          >
            <Heart className="w-[18px] h-[18px] sm:w-4 sm:h-4 stroke-[1.6]" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#191919] text-[#FDFBF8] font-sans text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none font-medium">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Shopping Bag */}
          <Link
            href="/cart"
            aria-label="Shopping Bag"
            className="relative text-[#77716D] hover:text-[#191919] transition-colors p-1"
          >
            <ShoppingBag className="w-[18px] h-[18px] sm:w-4 sm:h-4 stroke-[1.6]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#191919] text-[#FDFBF8] font-sans text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none font-medium">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Account / Profile — accessible on mobile and desktop */}
          <Link
            href={user ? "/account" : "/login"}
            aria-label="Account"
            className="text-[#77716D] hover:text-[#191919] transition-colors p-1"
          >
            <UserIcon className="w-[18px] h-[18px] sm:w-4 sm:h-4 stroke-[1.6]" />
          </Link>
        </div>
      </div>
    </header>
  );
}
