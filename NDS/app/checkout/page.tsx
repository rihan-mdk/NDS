"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Truck, Smartphone, ArrowLeft, CheckCircle2, AlertCircle, QrCode, Copy, Check, ExternalLink, Sparkles } from "lucide-react";
import { calculateDtdcShipping, INDIAN_STATES_LIST, detectStateFromPincode } from "@/lib/shipping";
import QRCode from "qrcode";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "true";

  const { items: cartItems, subtotal: cartSubtotal, tax: cartTax, shipping: cartShipping, discount: cartDiscount, total: cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [directItem, setDirectItem] = useState<CartItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isBuyNow) {
      try {
        const stored = sessionStorage.getItem("nds_direct_checkout");
        if (stored) {
          setDirectItem(JSON.parse(stored));
        }
      } catch (e) {
        console.warn("Could not load direct checkout item:", e);
      }
    }
  }, [isBuyNow]);

  // Determine active checkout items
  const items: CartItem[] = isBuyNow
    ? (directItem ? [directItem] : [])
    : cartItems;

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: "",
    fullName: user?.user_metadata?.full_name || "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    utr: "",
  });

  // Calculate pricing
  const subtotal = isBuyNow && directItem
    ? directItem.product.price * directItem.quantity
    : cartSubtotal;

  const discount = isBuyNow && directItem ? 0 : cartDiscount;
  const shippingInfo = calculateDtdcShipping(subtotal, formData.state, formData.pincode);
  const shipping = shippingInfo.rate;
  const total = subtotal - discount + shipping;

  useEffect(() => {
    // Only load saved address if the user is authenticated and has explicit addresses for their account
    if (!user?.id || user.id === "admin-usr-neels") return;

    const loadUserSavedAddress = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: addresses } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (addresses && addresses.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const def = addresses.find((a: any) => a.is_default) || addresses[0];
          if (def) {
            setFormData((prev) => ({
              ...prev,
              fullName: def.name || prev.fullName,
              phone: def.phone || prev.phone,
              address: def.street || prev.address,
              landmark: def.area || prev.landmark,
              city: def.city || prev.city,
              state: def.state || prev.state,
              pincode: def.pincode || prev.pincode,
            }));
          }
        }
      } catch (e) {
        console.warn("Could not load user saved address:", e);
      }
    };

    loadUserSavedAddress();
  }, [user]);

  const paymentMethod = "upi";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "paytmqr6owt0k@ptys";
  const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "Neel's Designer Studio";

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showQrMobile, setShowQrMobile] = useState(false);

  const upiLink = useMemo(() => {
    const note = encodeURIComponent(`Order NDS Total Rs ${total}`);
    const payee = encodeURIComponent(UPI_PAYEE_NAME);
    return `upi://pay?pa=${UPI_ID}&pn=${payee}&am=${total.toFixed(2)}&cu=INR&tn=${note}`;
  }, [total, UPI_ID, UPI_PAYEE_NAME]);

  useEffect(() => {
    if (total > 0 && upiLink) {
      QRCode.toDataURL(upiLink, {
        width: 280,
        margin: 1,
        color: {
          dark: "#191919",
          light: "#FFFFFF",
        },
      })
        .then((url: string) => setQrCodeDataUrl(url))
        .catch((err: unknown) => console.error("Error generating UPI QR code:", err));
    }
  }, [total, upiLink]);

  const handleCopyUpiId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2200);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrderId = `NDS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Build order record with separated payment status
    const newOrder = {
      id: generatedOrderId,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: new Date().toISOString(),
      status: "Payment Pending",
      paymentStatus: "Pending",
      items: [...items],
      total,
      shipping,
      shippingZone: shippingInfo.zoneName,
      shippingAddress: `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      paymentMethod: "UPI",
    };

    // Store ephemeral copy in sessionStorage solely for the immediate confirmation view
    try {
      sessionStorage.setItem("nds_last_order", JSON.stringify(newOrder));
      const existingHistory = JSON.parse(localStorage.getItem("nds_orders_history") || "[]");
      const updatedHistory = [newOrder, ...existingHistory.filter((o: any) => o.id !== newOrder.id)];
      localStorage.setItem("nds_orders_history", JSON.stringify(updatedHistory));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("nds_orders_updated"));
      }
    } catch (err) {
      console.warn("Could not save temporary order reference:", err);
    }

    // POST to Supabase via server route
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedOrderId,
          userId: user?.id || null,
          customerName: formData.fullName,
          customerEmail: formData.email || user?.email,
          customerPhone: formData.phone,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingState: formData.state,
          shippingPincode: formData.pincode,
          paymentMethod: "UPI",
          status: "Payment Pending",
          paymentStatus: "Pending",
          utr: formData.utr.trim() || null,
          total,
          giftPackaging: false,
          giftMessage: null,
          items: items.map((item) => ({
            productId: item.product.id,
            productTitle: item.product.title,
            productImage: item.product.images?.[0] || "",
            size: item.selectedSize,
            quantity: item.quantity,
            unitPrice: item.product.price,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.guestCancellationToken) {
          try {
            sessionStorage.setItem("nds_guest_cancel_token_" + generatedOrderId, data.guestCancellationToken);
          } catch {}
        }
      }
    } catch (err) {
      console.warn("Could not save order to cloud:", err);
    }

    setTimeout(() => {
      if (isBuyNow) {
        try {
          sessionStorage.removeItem("nds_direct_checkout");
        } catch {}
      } else {
        clearCart();
      }
      router.push(`/order-confirmation?orderId=${generatedOrderId}`);
    }, 1200);
  };

  if (mounted && items.length === 0) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FDFBF8] flex flex-col items-center justify-center px-6 py-20 text-center">
        <h2 className="font-serif text-2xl text-[#191919] mb-4">No items in your bag to checkout</h2>
        <Link
          href="/categories"
          className="px-6 py-3 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors"
        >
          Return to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Header */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pt-8 pb-6 border-b border-[#EAE5DF]">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] font-sans uppercase tracking-[0.2em] text-[#77716D] mb-3">
          <Link href={isBuyNow ? "/categories" : "/cart"} className="hover:text-[#191919] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3 h-3" />
            <span>{isBuyNow ? "Return to Collections" : "Return to Bag"}</span>
          </Link>
          <span>/</span>
          <span className="text-[#191919] font-semibold">Secure Checkout</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#191919] tracking-tight font-normal">
          {isBuyNow ? "Direct Purchase & Order Placement" : "Checkout & Order Placement"}
        </h1>
        <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#77716D] mt-1.5 font-medium">
          Direct Atelier Acquisition · 100% Prepaid via Direct UPI · Complimentary DTDC Express
        </p>
      </section>

      {/* Main Checkout Grid */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Customer & Shipping Details (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact Details */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <h2 className="font-serif text-xl sm:text-2xl text-[#191919] font-normal tracking-wide mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-[11px] flex items-center justify-center font-sans font-medium">1</span>
                <span>Contact &amp; Identification</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                    Phone Number (for DTDC Delivery SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <h2 className="font-serif text-xl sm:text-2xl text-[#191919] font-normal tracking-wide mb-6 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-[11px] flex items-center justify-center font-sans font-medium">2</span>
                <span>Shipping Destination</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                    Street Address / Apartment Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                      State *
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all cursor-pointer"
                    >
                      <option value="">Select State / Territory</option>
                      {INDIAN_STATES_LIST.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-sans text-[11px] uppercase tracking-[0.14em] font-semibold text-[#191919] mb-1.5">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => {
                        const cleanPin = e.target.value.replace(/\D/g, "").slice(0, 6);
                        const autoState = cleanPin.length >= 2 ? detectStateFromPincode(cleanPin) : null;
                        setFormData((prev) => ({
                          ...prev,
                          pincode: cleanPin,
                          state: prev.state || autoState || prev.state,
                        }));
                      }}
                      className="w-full p-3.5 bg-white border border-[#EAE5DF] font-sans text-xs text-[#191919] focus:outline-none focus:border-[#7B5644] focus:ring-1 focus:ring-[#7B5644]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Dynamic DTDC Courier Badge */}
                <div className="mt-4 p-4 bg-[#F5F3F0] border border-[#EAE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#191919] text-[#FDFBF8] flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
                          {shippingInfo.zoneName}
                        </span>
                        {shippingInfo.isFree && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 tracking-wider uppercase">
                            Free Shipping
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#77716D] mt-0.5">
                        DTDC Express · Estimated transit: {shippingInfo.estimate}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right sm:border-l sm:border-[#EAE5DF] sm:pl-4">
                    <span className={`text-xs font-semibold ${shippingInfo.isFree ? "text-emerald-700 font-bold" : "text-[#191919]"}`}>
                      {shippingInfo.isFree ? "Complimentary" : `₹${shippingInfo.rate}`}
                    </span>
                    <span className="block text-[9px] text-[#77716D] uppercase tracking-wider">
                      {shippingInfo.isFree ? "Orders ₹8,000+" : "Doorstep Express"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-xs flex items-center justify-center font-sans font-medium">3</span>
                  Payment Method
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 tracking-wider uppercase">
                    0% Transaction Fee
                  </span>
                  <span className="text-[10px] bg-[#EAE5DF] text-[#191919] font-semibold px-2 py-0.5 tracking-wider uppercase">
                    100% Prepaid
                  </span>
                </div>
              </div>

              {/* Strict No-COD Policy Alert */}
              <div className="mb-6 p-4 bg-[#F5F3F0] border-l-2 border-[#7B5644] space-y-1">
                <p className="text-xs font-semibold text-[#191919] uppercase tracking-wider">
                  Direct UPI Only · Cash on Delivery (COD) Unavailable
                </p>
                <p className="text-[11px] text-[#77716D] leading-relaxed">
                  Because each bespoke piece is individually prepared, hand-finished, or cut to order by our atelier, we do not accept Cash on Delivery. All orders are processed exclusively through direct bank-grade UPI.
                </p>
              </div>

              <div className="space-y-6">
                {/* Mobile Intent CTA (visible on mobile / small screens) */}
                <div className="block sm:hidden space-y-3">
                  <a
                    href={upiLink}
                    className="w-full py-4 px-4 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-xs font-semibold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>PAY VIA UPI APP</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[10px] text-center text-[#77716D]">
                    Opens Google Pay, PhonePe, Paytm, or BHIM with amount <strong className="text-[#191919]">₹{total.toLocaleString("en-IN")}</strong> pre-filled.
                  </p>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQrMobile(!showQrMobile)}
                      className="text-[11px] text-[#7B5644] underline uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      {showQrMobile ? "Hide Dynamic QR Code" : "Prefer scanning? Show Dynamic QR Code"}
                    </button>
                  </div>
                </div>

                {/* Dynamic QR Code Box (Always visible on desktop, toggleable on mobile) */}
                <div className={`${showQrMobile ? "block" : "hidden sm:block"} p-6 bg-white border border-[#EAE5DF] text-center space-y-4`}>
                  <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#191919]">
                    <QrCode className="w-4 h-4 text-[#7B5644]" />
                    <span>Scan &amp; Pay via Any UPI App</span>
                  </div>

                  <div className="inline-block p-3 bg-white border-2 border-[#191919] shadow-sm">
                    {qrCodeDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrCodeDataUrl}
                        alt="Direct UPI QR Code"
                        className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-xs text-[#77716D]">
                        Generating Dynamic QR...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="block font-serif text-lg font-bold text-[#191919]">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-[#77716D]">
                      Scan with Google Pay, PhonePe, Paytm, BHIM, CRED, or any banking app.
                    </p>
                  </div>
                </div>

                {/* Verified UPI ID / VPA with 1-Click Copy */}
                <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#77716D]">
                      Verified Atelier UPI ID / VPA
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#191919]">
                      {UPI_ID}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="px-4 py-2 bg-white border border-[#191919] hover:bg-[#191919] hover:text-[#FDFBF8] text-[#191919] text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>COPIED TO CLIPBOARD</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY UPI ID</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Optional UTR / Reference ID Input */}
                <div className="p-4 bg-white border border-[#EAE5DF] space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919]">
                    12-Digit UPI Transaction ID / UTR (Optional / Recommended)
                  </label>
                  <input
                    type="text"
                    value={formData.utr}
                    onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
                    maxLength={30}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE5DF] text-xs font-mono focus:outline-none focus:border-[#7B5644]"
                  />
                  <p className="text-[10px] text-[#77716D] leading-relaxed">
                    Once you complete the payment in your UPI app, enter the 12-digit UTR / UPI Ref number above. You can also send your payment receipt to our official WhatsApp concierge after placing the order.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Ledger Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 bg-[#F5F3F0] border border-[#EAE5DF] sticky top-28">
              <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider mb-6 pb-4 border-b border-[#EAE5DF]">
                {isBuyNow ? "Direct Order Item" : `In Your Bag (${items.length})`}
              </h2>

              {/* Items List Mini */}
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 pb-6 border-b border-[#EAE5DF]">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                    <div className="w-14 h-18 bg-[#EFEEEB] flex-shrink-0 overflow-hidden border border-[#EAE5DF]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-serif text-[#191919] line-clamp-1">{item.product.title}</p>
                      <p className="text-[10px] text-[#77716D]">
                        Qty: {item.quantity} · Size: {item.selectedSize}
                      </p>
                      <p className="text-xs font-semibold text-[#191919] mt-1">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-6 border-b border-[#EAE5DF] text-xs text-[#77716D]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#191919]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#7B5644] font-medium">
                    <span>Privilege Discount</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline">
                  <div>
                    <span>Express Courier (DTDC)</span>
                    <span className="text-[10px] text-[#77716D] block">
                      {shippingInfo.zoneName}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                    {shipping === 0 ? "Complimentary" : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>
                {shippingInfo.freeThresholdDiff > 0 && (
                  <p className="text-[10px] text-[#7B5644] pt-0.5 leading-snug">
                    Add ₹{shippingInfo.freeThresholdDiff.toLocaleString("en-IN")} more to unlock Complimentary Shipping
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="py-6 flex items-baseline justify-between border-b border-[#EAE5DF]">
                <span className="text-sm font-semibold uppercase tracking-widest text-[#191919]">
                  Total Payable
                </span>
                <span className="font-serif text-2xl font-bold text-[#191919]">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-4 px-6 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[11px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "REGISTERING ORDER..." : "CONFIRM UPI PAYMENT & PLACE ORDER"}
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] uppercase tracking-wider text-[#77716D] pt-4">
                <ShieldCheck className="w-4 h-4 text-[#7B5644]" />
                <span>Atelier Tamper-Proof Insurance Guaranteed</span>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] bg-[#FDFBF8] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#EAE5DF] border-t-[#7B5644] rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
