"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export function Footer() {
  const [activeModal, setActiveModal] = useState<"shipping" | "returns" | "privacy" | "terms" | null>(null);

  return (
    <footer className="w-full bg-[#F5F3F0] border-t border-[#EAE5DF] hidden lg:block">
      <div className="w-full px-6 sm:px-10 lg:px-14 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Brand */}
          <div>
            <h3 className="font-serif text-base uppercase tracking-[0.2em] text-[#191919] mb-3 font-normal">
              NEEL&apos;S DESIGNER STUDIO
            </h3>
            <p className="font-sans text-xs text-[#77716D] leading-relaxed max-w-xs">
              Contemporary couture, bridal elegance, and thoughtfully curated fashion for every special occasion.
            </p>
          </div>

          {/* Col 2: Shop */}
          <div>
            <h4 className="font-sans text-[10px] text-[#191919] uppercase tracking-[0.2em] font-semibold mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#77716D]">
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/categories">
                  All Categories
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/collections/lehenga">
                  Lehengas
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/collections/gown">
                  Gowns
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/collections/short-kurti">
                  Kurtis &amp; Separates
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/accessories">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Information */}
          <div>
            <h4 className="font-sans text-[10px] text-[#191919] uppercase tracking-[0.2em] font-semibold mb-4">
              INFORMATION
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#77716D]">
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-[#191919] transition-colors" href="/orders">
                  My Orders / Order Tracking
                </Link>
              </li>
              <li>
                <button
                  suppressHydrationWarning
                  onClick={() => setActiveModal("shipping")}
                  className="hover:text-[#191919] transition-colors text-left"
                >
                  Shipping &amp; Delivery
                </button>
              </li>
              <li>
                <button
                  suppressHydrationWarning
                  onClick={() => setActiveModal("returns")}
                  className="hover:text-[#191919] transition-colors text-left"
                >
                  Returns &amp; Exchange
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: CONNECT */}
          <div>
            <h4 className="font-sans text-[10px] text-[#191919] uppercase tracking-[0.2em] font-semibold mb-4">
              CONNECT
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#77716D]">
              <li>
                <a
                  href="https://wa.me/919999999999?text=Hello%20Neel%27s%20Designer%20Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#191919] transition-colors capitalize"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#191919] transition-colors capitalize"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#EAE5DF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#77716D] gap-4">
          <p>© 2026 NEEL&apos;S DESIGNER STUDIO. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <button
              suppressHydrationWarning
              onClick={() => setActiveModal("privacy")}
              className="hover:text-[#191919] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setActiveModal("terms")}
              className="hover:text-[#191919] transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Lightweight Luxury Informational Modals */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === "shipping" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  DELIVERY POLICIES
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Shipping &amp; Delivery</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <p>
                    All atelier pieces are securely shipped via fully insured express couriers (BlueDart Express and DHL International).
                  </p>
                  <p>
                    <strong>Ready-to-wear &amp; Accessories:</strong> Dispatched within 24–48 hours; delivery in 3–5 business days across India.
                  </p>
                  <p>
                    <strong>Bespoke &amp; Bridal Couture:</strong> Made to order with custom sizing; dispatched in 10–14 business days.
                  </p>
                  <p>
                    Complimentary express insured transit on all orders above ₹10,000.
                  </p>
                </div>
              </div>
            )}

            {activeModal === "returns" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  ATELIER ASSURANCE
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Returns &amp; Exchange</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <p>
                    Standard sizes may be exchanged within 7 days of delivery in unused condition with security tags intact.
                  </p>
                  <p>
                    <strong>Custom Tailored Pieces:</strong> Accompanied by complimentary lifetime fitting alterations through our WhatsApp Concierge.
                  </p>
                  <p>
                    To initiate an exchange or fitting adjustment, contact your dedicated concierge team with your order number.
                  </p>
                </div>
              </div>
            )}

            {activeModal === "privacy" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  PRIVACY COMMITMENT
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Privacy Policy</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <p>
                    Neel&apos;s Designer Studio respects your personal discretion. We collect only essential information required for order fulfillment and personalized bespoke consultation.
                  </p>
                  <p>
                    Your measurements, styling preferences, and payment details are securely encrypted and never shared with third parties.
                  </p>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  CLIENT TERMS
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Terms of Service</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <p>
                    All couture designs, textile motifs, and imagery shown on this platform are original intellectual creations of Neel&apos;s Designer Studio.
                  </p>
                  <p>
                    Prices listed in INR are inclusive of applicable GST taxes. Bespoke tailoring orders commence once initial specifications are confirmed.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
