"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, PackageCheck, Truck, Home, Download, ArrowRight } from "lucide-react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "NDS-2025-849201";

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Top Hero Banner */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 text-center border-b border-[#EAE5DF] bg-[#F5F3F0]">
        <div className="w-16 h-16 rounded-full bg-[#191919] text-[#FDFBF8] mx-auto flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
          ORDER ACQUIRED &amp; REGISTERED
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#191919] mb-4">
          Thank You for Your Patronage
        </h1>
        <p className="font-sans text-sm text-[#77716D] max-w-lg mx-auto leading-relaxed">
          Your order <strong className="text-[#191919]">{orderId}</strong> has been received by our master atelier. We are preparing your couture pieces with meticulous care.
        </p>
      </section>

      {/* 4-Stage Tracking Stepper */}
      <section className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className="p-6 sm:p-10 bg-[#FDFBF8] border border-[#EAE5DF] mb-10">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#191919] mb-8 text-center sm:text-left">
            Atelier Dispatch &amp; Tracking Progress
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#191919] text-[#FDFBF8] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs font-semibold text-[#191919] uppercase tracking-wider">Order Confirmed</p>
              <p className="text-[11px] text-[#77716D] mt-1">Payment verified &amp; logged</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-[#7B5644] text-[#FDFBF8] flex items-center justify-center mb-3 animate-pulse">
                <PackageCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#7B5644] uppercase tracking-wider">Atelier Packaging</p>
              <p className="text-[11px] text-[#77716D] mt-1">Hand-inspection &amp; muslin seal</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left opacity-50">
              <div className="w-10 h-10 rounded-full bg-[#EFEEEB] text-[#77716D] flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#191919] uppercase tracking-wider">In Transit</p>
              <p className="text-[11px] text-[#77716D] mt-1">BlueDart Express Air Courier</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left opacity-50">
              <div className="w-10 h-10 rounded-full bg-[#EFEEEB] text-[#77716D] flex items-center justify-center mb-3">
                <Home className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#191919] uppercase tracking-wider">Out for Delivery</p>
              <p className="text-[11px] text-[#77716D] mt-1">Arriving at your residence</p>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Shipping Address Recap */}
          <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF]">
            <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#191919] mb-4">
              Delivery Destination
            </h3>
            <p className="text-sm font-semibold text-[#191919] mb-1">Aaradhya Singhania</p>
            <p className="text-xs text-[#77716D] leading-relaxed mb-4">
              Penthouse 14B, Imperial Residency, Marine Drive<br />
              Opposite Sea Face Promenade<br />
              Mumbai, Maharashtra - 400020
            </p>
            <p className="text-xs text-[#77716D]">
              <strong>Courier Partner:</strong> BlueDart Insured Air Express
            </p>
            <p className="text-xs text-[#77716D] mt-1">
              <strong>Estimated Arrival:</strong> 3-4 Business Days
            </p>
          </div>

          {/* Payment & Action Recap */}
          <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF] flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#191919] mb-4">
                Atelier Guarantee
              </h3>
              <p className="text-xs text-[#77716D] leading-relaxed mb-4">
                Every bespoke piece includes our signature tamper-proof seal, an authenticated craftsman certificate, and breathable archival storage casing.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#EAE5DF]">
              <button
                onClick={() => alert(`Downloading formal tax invoice for ${orderId}...`)}
                className="w-full py-3 px-4 bg-[#FDFBF8] border border-[#191919] text-[#191919] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#191919] hover:text-[#FDFBF8] transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD TAX INVOICE (PDF)</span>
              </button>

              <Link
                href="/orders"
                className="w-full py-3 px-4 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors flex items-center justify-center gap-2"
              >
                <span>VIEW ORDER HISTORY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif">Loading Order Confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

