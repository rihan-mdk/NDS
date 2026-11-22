"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Truck, Smartphone, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

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

  // Calculate pricing
  const subtotal = isBuyNow && directItem
    ? directItem.product.price * directItem.quantity
    : cartSubtotal;

  const discount = isBuyNow && directItem ? 0 : cartDiscount;
  const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 1500;
  const tax = Math.round((subtotal - discount) * 0.12);
  const total = subtotal - discount + tax + shipping;

  const [formData, setFormData] = useState({
    email: user?.email || "",
    phone: "",
    fullName: user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : ""),
    address: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    giftPackaging: false,
    giftMessage: "",
    utr: "",
  });

  useEffect(() => {
    try {
      const savedAddresses = localStorage.getItem("nds_saved_addresses");
      const savedDetails = localStorage.getItem("nds_saved_details");
      if (savedAddresses) {
        const addrs = JSON.parse(savedAddresses);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const def = addrs.find((a: any) => a.isDefault) || addrs[0];
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
      } else if (savedDetails) {
        const details = JSON.parse(savedDetails);
        setFormData((prev) => ({
          ...prev,
          fullName: details.fullName || prev.fullName,
          email: details.email || prev.email,
          phone: details.phone || prev.phone,
          address: details.address || prev.address,
          city: details.city || prev.city,
          pincode: details.pincode || prev.pincode,
        }));
      }
    } catch (e) {
      console.warn("Could not load saved address in checkout:", e);
    }
  }, [user]);

  const paymentMethod = "upi";
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          giftPackaging: formData.giftPackaging,
          giftMessage: formData.giftMessage,
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
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#77716D] mb-3">
          <Link href={isBuyNow ? "/categories" : "/cart"} className="hover:text-[#191919] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>{isBuyNow ? "Return to Collections" : "Return to Bag"}</span>
          </Link>
          <span>/</span>
          <span className="text-[#191919]">Secure Checkout</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#191919]">
          {isBuyNow ? "Direct Purchase & Order Placement" : "Checkout & Order Placement"}
        </h1>
      </section>

      {/* Main Checkout Grid */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-10">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT: Customer & Shipping Details (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact Details */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-xs flex items-center justify-center font-sans font-medium">1</span>
                Contact &amp; Identification
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                    placeholder="patron@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Phone Number (for DTDC Delivery SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-xs flex items-center justify-center font-sans font-medium">2</span>
                Shipping Destination
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                    placeholder="Aditi Roy Kapoor"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Street Address / Apartment Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                    placeholder="Bunglow 4, Malabar Hill, Ridge Road"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full p-3 bg-white border border-[#EAE5DF] text-xs focus:outline-none focus:border-[#7B5644]"
                      placeholder="400006"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Preference */}
            <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8">
              <h2 className="font-serif text-xl text-[#191919] uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#191919] text-[#FDFBF8] text-xs flex items-center justify-center font-sans font-medium">3</span>
                Payment Method
              </h2>
              <div className="space-y-4 mb-6">
                {/* UPI — Sole Accepted Payment Method */}
                <div className="p-4 border border-[#191919] bg-[#F5F3F0] flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-[#7B5644] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-[#191919]">UPI Transfer (Manual Verification)</p>
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
                        Payment Pending Verification
                      </span>
                    </div>
                    <p className="text-[10px] text-[#77716D] mt-1">Google Pay, PhonePe, Paytm, BHIM or Bank UPI App</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#191919] mt-0.5 flex-shrink-0" />
                </div>

                {/* Honest Verification Notice */}
                <div className="p-4 bg-[#FAF8F5] border border-[#EAE5DF] text-xs text-[#77716D] space-y-1.5 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[#7B5644] font-semibold text-[10px] uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Payment Verification Policy</span>
                  </div>
                  <p>
                    Selecting UPI registers your order in <strong className="text-[#191919]">Payment Pending</strong> status. It does <strong>not</strong> serve as proof of payment.
                  </p>
                  <p>
                    Our atelier concierge will verify your payment with our accounts team before your bespoke creation is confirmed and released for packaging.
                  </p>
                  <p className="text-[11px] text-[#191919] font-medium pt-1 border-t border-[#EAE5DF]">
                    Grace Period: Eligible for 100% full refund if cancelled within 24 hours of placement.
                  </p>
                </div>

                {/* Optional UPI Transaction Reference / UTR Input */}
                <div className="p-4 bg-white border border-[#EAE5DF]">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    UPI Transaction Reference / UTR (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.utr}
                    onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
                    maxLength={30}
                    placeholder="e.g. 412839201948 (12-digit UTR)"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#EAE5DF] text-xs font-mono focus:outline-none focus:border-[#7B5644]"
                  />
                  <p className="text-[10px] text-[#77716D] mt-1.5 leading-relaxed">
                    If you have completed your UPI transfer, enter your 12-digit reference number. Submitting a UTR aids manual ledger reconciliation and does <strong>not</strong> serve as automated proof of payment; our atelier desk verifies receipt before confirmation.
                  </p>
                </div>
              </div>

              {/* Gift Packaging Option */}
              <div className="pt-4 border-t border-[#EAE5DF]">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.giftPackaging}
                    onChange={(e) => setFormData({ ...formData, giftPackaging: e.target.checked })}
                    className="w-4 h-4 rounded-none accent-[#191919]"
                  />
                  <span className="text-xs font-medium text-[#191919]">
                    Include signature velvet gift packaging &amp; handwritten monogram card
                  </span>
                </label>
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
                <div className="flex justify-between">
                  <span>Estimated GST (12%)</span>
                  <span className="font-semibold text-[#191919]">₹{tax.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Express Courier (DTDC)</span>
                  <span className="text-emerald-700 font-semibold uppercase text-[11px]">
                    {shipping === 0 ? "Complimentary" : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>
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
                {isSubmitting ? "REGISTERING ORDER..." : "PLACE ORDER (PAYMENT PENDING VERIFICATION)"}
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
