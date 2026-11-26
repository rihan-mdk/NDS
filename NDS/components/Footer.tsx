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
              ATELIER CONCIERGE
            </h4>
            <ul className="space-y-2.5 font-sans text-xs text-[#77716D]">
              <li>
                <a
                  href="https://wa.me/918123200215?text=Hello%20Neel%27s%20Designer%20Studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#191919] transition-colors"
                >
                  WhatsApp: +91 8123200215
                </a>
              </li>
              <li>
                <a
                  href="tel:+918123200215"
                  className="hover:text-[#191919] transition-colors"
                >
                  Phone: +91 8123200215
                </a>
              </li>
              <li>
                <a
                  href="tel:+919740259215"
                  className="hover:text-[#191919] transition-colors"
                >
                  Secondary: +91 9740259215
                </a>
              </li>
              <li>
                <a
                  href="mailto:neels9589@gmail.com"
                  className="hover:text-[#191919] transition-colors"
                >
                  neels9589@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#191919] transition-colors"
                >
                  Instagram @neels_designer_studio
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#EAE5DF] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#77716D] gap-4">
          <p>© 2026 NEEL&apos;S DESIGNER STUDIO. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link
              href="/privacy"
              className="hover:text-[#191919] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[#191919] transition-colors"
            >
              Terms &amp; Conditions
            </Link>
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
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
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
                    <strong>Coverage:</strong> Delivery across India via DTDC or another suitable courier partner.
                  </p>
                  <p>
                    <strong>Shipping Charges:</strong> Free shipping on orders of ₹8,000 or above. For orders below ₹8,000, actual applicable courier charges apply.
                  </p>
                  <p>
                    <strong>Estimated Delivery:</strong> Standard locations approximately 5–7 business days; remote locations approximately 7–10 business days. Order processing takes 1–3 business days prior to dispatch.
                  </p>
                  <p className="pt-2">
                    <Link
                      href="/terms"
                      onClick={() => setActiveModal(null)}
                      className="text-[#191919] underline font-medium hover:text-[#7B5644]"
                    >
                      Read full Shipping &amp; Delivery terms in Terms &amp; Conditions →
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {activeModal === "returns" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  CANCELLATIONS &amp; EXCHANGES
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Order Cancellation &amp; Refund Policy</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <div className="p-3 bg-[#F5F3F0] border border-[#EAE5DF] text-[#191919] space-y-1">
                    <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                      Order Cancellation:
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[#77716D]">
                      <li>Customers who wish to cancel an order must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                      <li>Cancellation requests must be submitted within 24 hours of placing the order.</li>
                      <li>Approved cancellations within this period are eligible for a full refund, including shipping charges paid.</li>
                      <li>Requests submitted after 24 hours may not be accepted, particularly if the order has already been processed or dispatched.</li>
                      <li>Cancellation is subject to confirmation by the shop owner.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-[#F5F3F0] border border-[#EAE5DF] text-[#191919] space-y-1">
                    <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                      Refund Policy:
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-[#77716D]">
                      <li>For refund-related enquiries, customers must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                      <li>Approved cancellations within 24 hours qualify for a 100% refund, including shipping charges.</li>
                      <li>Refund requests relating to damaged, defective, or incorrect products will be reviewed individually.</li>
                      <li>Once approved, refunds will be arranged through the applicable payment method.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] space-y-1">
                    <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">Contact for Cancellation and Refunds:</strong>
                    <p>WhatsApp: <a href="https://wa.me/918123200215" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">+91 8123200215</a></p>
                    <p>Instagram: <a href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">Neel&apos;s Designer Studio official Instagram account</a></p>
                    <p>Email: <a href="mailto:neels9589@gmail.com" className="underline hover:text-[#7B5644]">neels9589@gmail.com</a></p>
                    <p className="text-[11px] text-[#77716D] pt-0.5">Please provide your order ID and registered contact number when contacting us.</p>
                  </div>

                  <p className="pt-2">
                    <Link
                      href="/terms"
                      onClick={() => setActiveModal(null)}
                      className="text-[#191919] underline font-medium hover:text-[#7B5644]"
                    >
                      Read full Terms &amp; Conditions →
                    </Link>
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
                    Neel&apos;s Designer Studio respects your personal privacy. We do not sell personal information and collect only information required to fulfill orders, support customer inquiries, and comply with legal obligations.
                  </p>
                  <p>
                    We do not collect or store full credit card numbers, CVV codes, UPI PINs, or banking passwords on our website. Payments are completed directly via bank-grade peer-to-merchant UPI transfer protocols (0% intermediary fees).
                  </p>
                  <p className="pt-2">
                    <Link
                      href="/privacy"
                      onClick={() => setActiveModal(null)}
                      className="text-[#191919] underline font-medium hover:text-[#7B5644]"
                    >
                      Read complete Privacy Policy page →
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
                  TERMS &amp; CONDITIONS
                </span>
                <h3 className="font-serif text-2xl text-[#191919] mb-4">Terms &amp; Conditions</h3>
                <div className="space-y-3 font-sans text-xs text-[#77716D] leading-relaxed">
                  <p>
                    By accessing our website or placing an order, you agree to our terms regarding direct UPI prepaid order processing (Cash on Delivery is unavailable due to bespoke cutting), delivery via DTDC express courier, 24-hour cancellation window, and conditional exchanges.
                  </p>
                  <p className="pt-2">
                    <Link
                      href="/terms"
                      onClick={() => setActiveModal(null)}
                      className="text-[#191919] underline font-medium hover:text-[#7B5644]"
                    >
                      Read complete Terms &amp; Conditions page →
                    </Link>
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
