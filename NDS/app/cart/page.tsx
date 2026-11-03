"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, ArrowRight, ShieldCheck, Tag, ArrowLeft } from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    tax,
    shipping,
    discount,
    promoCode,
    applyPromoCode,
    removePromoCode,
    total,
  } = useCart();

  const [inputCode, setInputCode] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = await applyPromoCode(inputCode);
    setPromoMessage(res);
  };

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-[#FDFBF8] flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold mb-3">
          ATELIER WARDROBE
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#191919] mb-4">
          Your Shopping Bag is Empty
        </h1>
        <p className="font-sans text-sm text-[#77716D] max-w-md mb-8 leading-relaxed">
          Discover our curated collection of imperial lehengas, evening drape gowns, and fine jewels.
        </p>
        <Link
          href="/categories"
          className="inline-flex items-center px-8 py-4 bg-[#191919] text-[#FDFBF8] text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#7B5644] transition-colors"
        >
          <span>EXPLORE COLLECTIONS</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Header Bar */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pt-10 pb-6 border-b border-[#EAE5DF]">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#77716D] mb-4">
          <Link href="/" className="hover:text-[#191919] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-[#191919]">Shopping Bag</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#191919]">
            Shopping Bag
          </h1>
          <span className="text-xs text-[#77716D] uppercase tracking-wider">
            {items.reduce((acc, i) => acc + i.quantity, 0)} Items Curated
          </span>
        </div>
      </section>

      {/* Main Bag Content */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Itemized Bag Ledger (7 cols) */}
          <div className="lg:col-span-7 divide-y divide-[#EAE5DF]">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="py-6 first:pt-0 flex gap-4 sm:gap-6">
                {/* Product Thumbnail */}
                <div className="relative w-24 sm:w-32 aspect-[3/4] bg-[#EFEEEB] border border-[#EAE5DF] flex-shrink-0 overflow-hidden">
                  <Link href={`/product/${item.product.slug}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";
                      }}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-medium">
                        {item.product.categoryLabel}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        aria-label="Remove item"
                        className="text-[#77716D] hover:text-[#BA1A1A] p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-serif text-base sm:text-lg text-[#191919] hover:text-[#7B5644] transition-colors leading-snug">
                        {item.product.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#77716D] mt-1">
                      Size: <span className="font-semibold text-[#191919]">{item.selectedSize}</span>
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-[#F5F3F0] mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-[#EAE5DF] bg-[#F5F3F0]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs hover:text-[#7B5644]"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:text-[#7B5644]"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-serif text-base sm:text-lg font-semibold text-[#191919]">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Financial Summary & Checkout Suite (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 bg-[#F5F3F0] border border-[#EAE5DF]">
              <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider mb-6 pb-4 border-b border-[#EAE5DF]">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-xs text-[#77716D] pb-6 border-b border-[#EAE5DF]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-serif font-semibold text-[#191919]">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#7B5644] font-medium">
                    <span>Atelier Privilege ({promoCode})</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated GST (12%)</span>
                  <span className="font-serif font-semibold text-[#191919]">
                    ₹{tax.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Insured Express Courier</span>
                  <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[11px]">
                    {shipping === 0 ? "Complimentary" : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Total Row */}
              <div className="py-6 flex items-baseline justify-between border-b border-[#EAE5DF]">
                <span className="text-sm font-semibold uppercase tracking-widest text-[#191919]">
                  Total Amount
                </span>
                <span className="font-serif text-2xl font-bold text-[#191919]">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Promo Code Input */}
              <div className="py-6 border-b border-[#EAE5DF]">
                <div className="flex items-center space-x-1 mb-2 text-[10px] uppercase tracking-widest text-[#191919] font-semibold">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Promo / Gift Voucher</span>
                </div>
                {promoCode ? (
                  <div className="flex items-center justify-between bg-[#FDFBF8] p-2.5 border border-emerald-300">
                    <span className="text-xs text-emerald-800 font-medium">
                      Applied: <strong>{promoCode}</strong>
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-[10px] text-red-600 uppercase tracking-widest hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="e.g. ATELIER10"
                      className="flex-1 px-3 py-2 text-xs bg-[#FDFBF8] border border-[#EAE5DF] focus:outline-none uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644]"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoMessage && (
                  <p className={`text-[11px] mt-2 ${promoMessage.success ? "text-emerald-700" : "text-red-600"}`}>
                    {promoMessage.message}
                  </p>
                )}
              </div>

              {/* Checkout CTA */}
              <div className="pt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[11px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-wider text-[#77716D] pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#7B5644]" />
                  <span>256-Bit Encrypted Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

