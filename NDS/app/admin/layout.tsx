"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Users,
  Tag,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Route protection guard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/login?redirect=/admin");
      } else if (!isAdmin) {
        // Authenticated but not an admin -> redirect away
        router.replace("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#FDFBF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-2 border-[#EAE5DF] border-t-[#7B5644] rounded-full animate-spin mb-4" />
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold mb-1">
          NEEL&apos;S DESIGNER STUDIO
        </span>
        <h2 className="font-serif text-xl sm:text-2xl text-[#191919] font-normal">
          Verifying Atelier Privileges...
        </h2>
      </div>
    );
  }

  // Not authorized state while redirecting
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#FDFBF8] flex flex-col items-center justify-center p-6 text-center">
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-red-700 font-semibold mb-2">
          RESTRICTED ACCESS
        </span>
        <h2 className="font-serif text-2xl text-[#191919] font-normal mb-2">
          Administrator Verification Required
        </h2>
        <p className="text-xs text-[#77716D] mb-6 max-w-sm">
          This portal is reserved for atelier management. Redirecting to authorized sign-in...
        </p>
        <Link
          href="/login?redirect=/admin"
          className="px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors"
        >
          Sign In as Administrator
        </Link>
      </div>
    );
  }

  const navLinks = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      exact: false,
    },
    {
      name: "Promos",
      href: "/admin/promos",
      icon: Tag,
      exact: false,
    },
    {
      name: "Roles",
      href: "/admin/roles",
      icon: Users,
      exact: false,
    },
  ];

  const isNavActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen w-full bg-[#FDFBF8] flex flex-col lg:flex-row text-[#191919]">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#191919] text-[#FDFBF8] flex-shrink-0 min-h-screen sticky top-0 h-screen border-r border-[#2A2621]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2A2621]">
          <Link href="/admin" className="block">
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#C9A96E] font-semibold block mb-1">
              ATELIER MANAGEMENT
            </span>
            <h1 className="font-serif text-xl tracking-tight text-[#FDFBF8] font-normal">
              Neel&apos;s Studio
            </h1>
          </Link>
          <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 bg-[#25221D] border border-[#3A352D] rounded-xs text-[10px] text-[#D6D0C8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="truncate">{user.email}</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navLinks.map((item) => {
            const active = isNavActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase transition-colors rounded-xs ${
                  active
                    ? "bg-[#25221D] text-[#C9A96E] font-semibold border-l-2 border-[#C9A96E]"
                    : "text-[#A8A29E] hover:text-[#FDFBF8] hover:bg-[#25221D]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-[#C9A96E]" : "text-[#77716D]"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#2A2621] space-y-2">
          {/* View Storefront */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-2.5 text-xs text-[#A8A29E] hover:text-[#FDFBF8] hover:bg-[#25221D] transition-colors rounded-xs"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>View Storefront</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors rounded-xs text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE TOPBAR & DRAWER ── */}
      <header className="lg:hidden flex items-center justify-between px-5 h-14 bg-[#191919] text-[#FDFBF8] sticky top-0 z-40 border-b border-[#2A2621]">
        <div>
          <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-[#C9A96E] font-semibold block">
            ADMIN PORTAL
          </span>
          <h1 className="font-serif text-base tracking-tight text-[#FDFBF8]">
            Neel&apos;s Studio
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
          className="p-2 text-[#D6D0C8] hover:text-[#FDFBF8]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-[#191919] z-30 border-b border-[#2A2621] p-4 shadow-xl space-y-2 animate-in slide-in-from-top duration-200">
          <div className="px-3 py-2 text-[11px] text-[#A8A29E] border-b border-[#2A2621] mb-2 truncate">
            Signed in as: <span className="text-[#FDFBF8] font-medium">{user.email}</span>
          </div>

          {navLinks.map((item) => {
            const active = isNavActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-xs uppercase tracking-wider rounded-xs ${
                  active ? "bg-[#25221D] text-[#C9A96E] font-semibold" : "text-[#D6D0C8] hover:text-[#FDFBF8]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#2A2621] flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#C9A96E] flex items-center gap-1.5 py-2 px-3"
            >
              <span>Visit Store</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-400 py-2 px-3 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

