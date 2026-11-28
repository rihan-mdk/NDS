"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on admin routes, login page, and signup page
  if (
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname?.startsWith("/login/") ||
    pathname === "/signup" ||
    pathname?.startsWith("/signup/")
  ) {
    return null;
  }

  const phoneNumber = "918123200215"; // +91 8123200215 (Verified business WhatsApp)
  const defaultMessage = encodeURIComponent(
    "Hello Neel's Designer Studio, I would like to inquire about your bespoke couture and bridal collections."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="WhatsApp Concierge"
      className="fixed bottom-[102px] lg:bottom-7 right-4 sm:right-6 lg:right-7 z-40 flex items-center gap-3 select-none"
    >
      {/* Luxury Tooltip (Desktop) */}
      <div
        className={`hidden lg:flex items-center gap-2 bg-[#191919] text-[#FDFBF8] text-[11px] uppercase tracking-[0.16em] font-medium py-2 px-3.5 border border-[#C29B38]/40 shadow-xl rounded-full transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-3 pointer-events-none"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
        <span>Atelier Concierge</span>
      </div>

      {/* Round Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-[0_6px_22px_rgba(37,211,102,0.4)] hover:shadow-[0_10px_28px_rgba(37,211,102,0.6)] hover:scale-108 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-[#FDFBF8]"
        aria-label="Chat with Neel's Designer Studio Atelier Concierge on WhatsApp (+91 8123200215)"
      >
        {/* Subtle breathing glow ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-0 animate-ping pointer-events-none" />

        {/* WhatsApp Vector Icon */}
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          className="w-7 h-7 fill-white transition-transform duration-300 group-hover:scale-110 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.57 14.39C16.32 14.27 15.11 13.67 14.88 13.58C14.65 13.5 14.49 13.46 14.32 13.7C14.16 13.95 13.69 14.51 13.54 14.68C13.4 14.84 13.25 14.86 13 14.74C12.75 14.61 11.71 14.27 10.48 13.17C9.52 12.31 8.87 11.25 8.73 11C8.59 10.75 8.71 10.62 8.84 10.5C8.95 10.38 9.09 10.2 9.22 10.05C9.35 9.9 9.39 9.79 9.47 9.63C9.55 9.46 9.51 9.32 9.45 9.2C9.39 9.08 8.9 7.87 8.7 7.38C8.5 6.9 8.3 6.96 8.15 6.96C8.02 6.95 7.86 6.95 7.7 6.95C7.54 6.95 7.27 7.01 7.05 7.25C6.83 7.49 6.2 8.08 6.2 9.29C6.2 10.5 7.08 11.66 7.2 11.83C7.33 11.99 8.94 14.47 11.4 15.53C11.99 15.78 12.44 15.93 12.8 16.05C13.39 16.23 13.93 16.21 14.36 16.14C14.84 16.07 15.84 15.54 16.05 14.93C16.25 14.32 16.25 13.8 16.19 13.7C16.13 13.58 15.98 13.51 15.73 13.39L16.57 14.39Z" />
        </svg>
      </a>
    </aside>
  );
}
