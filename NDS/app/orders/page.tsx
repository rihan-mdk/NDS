"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Truck, CheckCircle2, Home, ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ReviewModal } from "@/components/ReviewModal";
import { ProductReview } from "@/lib/reviews-data";

interface Order {
  id: string;
  date: string;
  createdAt?: string;
  status: "Payment Pending" | "Confirmed" | "Shipped" | "Delivered" | "Processing" | "Cancelled";
  paymentStatus?: "Pending" | "Paid" | "Refund Pending" | "Refunded" | "No Refund Due";
  utr?: string;
  items: any[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const targetOrderId = searchParams.get("id");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [reviewingTarget, setReviewingTarget] = useState<{
    orderId: string;
    product: {
      id: string;
      slug: string;
      title: string;
      image?: string;
      selectedSize?: string;
    };
  } | null>(null);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());

  // Load reviewed items tracker
  useEffect(() => {
    try {
      const localReviews: ProductReview[] = JSON.parse(
        localStorage.getItem("nds_product_reviews") || "[]"
      );
      const keys = new Set(localReviews.map((r) => `${r.orderId}_${r.productId}`));
      setReviewedKeys(keys);
    } catch {}
  }, []);

  useEffect(() => {
    // 1. Authoritative fetch from Supabase if user is logged in
    if (user?.id) {
      fetch(`/api/admin/orders?userId=${user.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.orders?.length > 0) {
            setOrders(data.orders);
            if (targetOrderId) {
              const found = data.orders.find((o: Order) => o.id === targetOrderId);
              if (found) setSelectedOrder(found);
            }
          }
        })
        .catch(() => {});
    } else {
      // 2. For unauthenticated guest sessions, only check the active session's recent order
      try {
        const sessionStored = sessionStorage.getItem("nds_last_order");
        if (sessionStored) {
          const parsed = JSON.parse(sessionStored);
          if (parsed && parsed.id) {
            setOrders([parsed]);
            if (targetOrderId && parsed.id === targetOrderId) {
              setSelectedOrder(parsed);
            }
          }
        }
      } catch (e) {
        console.warn("Could not load recent session order:", e);
      }
    }
  }, [targetOrderId, user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you wish to cancel this order? Cancellations within 24 hours receive a 100% full refund including shipping.")) {
      return;
    }

    setCancellingId(orderId);
    setCancelMessage(null);

    try {
      let cancellationToken: string | null = null;
      try {
        cancellationToken = sessionStorage.getItem("nds_guest_cancel_token_" + orderId);
      } catch {}

      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ...(cancellationToken ? { cancellationToken } : {}),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCancelMessage(data.message);
        // Update local state with accurate payment and fulfillment status
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? { ...o, status: "Cancelled", paymentStatus: data.paymentStatus }
              : o
          )
        );
        setSelectedOrder((prev) =>
          prev && prev.id === orderId
            ? { ...prev, status: "Cancelled", paymentStatus: data.paymentStatus }
            : prev
        );
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch {
      alert("Network error while submitting cancellation request.");
    } finally {
      setCancellingId(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Confirmed":
        return "bg-[#F5EAE1] text-[#7B5644] border border-[#EAE5DF]";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Payment Pending":
        return "bg-amber-100 text-amber-900 border border-amber-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-[#F5F3F0] text-[#77716D] border border-[#EAE5DF]";
    }
  };

  // Tracking steps based on status
  const getTrackingStep = (status: string) => {
    switch (status) {
      case "Payment Pending": return 0;
      case "Confirmed":        return 1;
      case "Processing":       return 2;
      case "Shipped":          return 3;
      case "Delivered":        return 4;
      default:                 return 0;
    }
  };

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Header */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pt-10 pb-6 border-b border-[#EAE5DF]">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#77716D] mb-4">
          <Link href="/" className="hover:text-[#191919] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-[#191919] transition-colors">My Account</Link>
          <span>/</span>
          <span className="text-[#191919]">My Orders</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#191919]">Order History &amp; Tracking</h1>
      </section>

      <section className="w-full px-6 sm:px-10 lg:px-14 py-10">
        {selectedOrder ? (
          /* ── ORDER DETAIL VIEW ── */
          <div className="max-w-3xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#77716D] hover:text-[#191919] transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Orders
            </button>

            {/* Order Header */}
            <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[#77716D] mb-1">Order Reference</p>
                  <p className="font-serif text-xl text-[#191919]">{selectedOrder.id}</p>
                </div>
                <span className={`text-[9px] uppercase tracking-widest font-semibold px-3 py-1 self-start ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#77716D]">
                <div>
                  <p className="text-[#191919] font-medium mb-0.5">Order Date</p>
                  <p>{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-[#191919] font-medium mb-0.5">Payment</p>
                  <p>{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[#191919] font-medium mb-0.5">Total</p>
                  <p className="font-serif text-[#191919] font-semibold">₹{selectedOrder.total?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Status Informational Callout */}
            {selectedOrder.status === "Payment Pending" && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 text-xs mb-6">
                <p className="font-semibold text-amber-900 mb-1 uppercase tracking-wider text-[10px]">
                  Payment Pending Verification
                </p>
                <p className="leading-relaxed">
                  Your order is registered under UPI. Selecting UPI does not constitute proof of payment. Please transfer the total to our verified accounts VPA or WhatsApp concierge (<strong className="font-medium">+91 8123200215</strong>). Once verified by our accounts desk, your order status will be marked <em>Confirmed</em>.
                </p>
              </div>
            )}

            {selectedOrder.status === "Cancelled" && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 text-xs mb-6">
                <p className="font-semibold text-rose-900 mb-1 uppercase tracking-wider text-[10px]">
                  Order Cancelled
                </p>
                <p className="leading-relaxed font-medium">
                  {selectedOrder.paymentStatus === "Refunded"
                    ? "Your refund has been processed."
                    : selectedOrder.paymentStatus === "Refund Pending"
                    ? "Your order has been cancelled. Your refund is pending."
                    : "Your order has been cancelled. No refund is due because payment was not received."}
                </p>
              </div>
            )}

            {/* 4-Stage Tracking Timeline */}
            <div className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919] mb-6">
                Commission &amp; Dispatch Progress (DTDC Express)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Payment & Confirmation", icon: CheckCircle2, step: 1 },
                  { label: "Atelier Packing", icon: Package, step: 2 },
                  { label: "In Transit", icon: Truck, step: 3 },
                  { label: "Delivered", icon: Home, step: 4 },
                ].map(({ label, icon: Icon, step }) => {
                  const current = getTrackingStep(selectedOrder.status);
                  const isActive = step <= current && selectedOrder.status !== "Cancelled";
                  const isCurrent = step === current && selectedOrder.status !== "Cancelled";
                  return (
                    <div key={step} className={`flex flex-col items-center text-center ${isActive ? "" : "opacity-40"}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 ${isCurrent ? "bg-[#7B5644] animate-pulse" : isActive ? "bg-[#191919]" : "bg-[#EFEEEB]"}`}>
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#FDFBF8]" : "text-[#77716D]"}`} />
                      </div>
                      <p className="text-[9px] uppercase tracking-wide font-semibold text-[#191919] leading-tight">{label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 24-Hour Cancellation Policy Card */}
            <div className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919]">
                    Order Cancellation Policy (Within 24 Hours)
                  </h4>
                  <p className="text-xs text-[#77716D] max-w-xl leading-relaxed">
                    Customers who wish to cancel an order must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram within <strong>24 hours of placing the order</strong>. Approved cancellations within this period are eligible for a <strong>100% full refund</strong>, including shipping charges. Cancellation is subject to confirmation by the shop owner.
                  </p>
                  <div className="text-[11px] text-[#191919] bg-[#F5F3F0] border border-[#EAE5DF] p-3 max-w-xl space-y-1">
                    <span className="font-semibold block text-[#7B5644] uppercase tracking-wider text-[10px]">Direct Concierge Support:</span>
                    <p>WhatsApp: <a href={`https://wa.me/918123200215?text=${encodeURIComponent(`Hello Neel's Designer Studio, I would like to request cancellation for Order ID: ${selectedOrder.id}. My registered contact number is: ${selectedOrder.phone || ""}`)}`} target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-[#7B5644]">+91 8123200215</a></p>
                    <p>Instagram: <a href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-[#7B5644]">@neels_designer_studio</a></p>
                    <p className="text-[#77716D]">Please provide your order ID ({selectedOrder.id}) and registered contact number.</p>
                  </div>
                  {cancelMessage && (
                    <p className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 font-medium">
                      {cancelMessage}
                    </p>
                  )}
                </div>
                {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Delivered" && selectedOrder.status !== "Shipped" && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={cancellingId === selectedOrder.id}
                    className="px-4 py-2 bg-rose-50 text-rose-800 border border-rose-300 text-[10px] uppercase tracking-wider font-semibold hover:bg-rose-100 disabled:opacity-50 transition-colors shrink-0"
                  >
                    {cancellingId === selectedOrder.id ? "Processing..." : "Submit Cancellation"}
                  </button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919] mb-4">
                Items in this Order ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-[#F5F3F0] space-y-0">
                {(selectedOrder.items || []).map((item: any, idx: number) => {
                  const prodId = item.product?.id || `prod-${idx}`;
                  const prodSlug =
                    item.product?.slug ||
                    item.product?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") ||
                    "atelier-creation";
                  const reviewKey = `${selectedOrder.id}_${prodId}`;
                  const isReviewed = reviewedKeys.has(reviewKey);

                  return (
                    <div key={idx} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 bg-[#EFEEEB] aspect-[3/4] border border-[#EAE5DF] overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";
                              }}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${prodSlug}`}
                            className="text-xs font-serif text-[#191919] hover:text-[#7B5644] transition-colors block truncate font-medium"
                          >
                            {item.product?.title}
                          </Link>
                          <p className="text-[11px] text-[#77716D]">
                            Size: {item.selectedSize || "Standard"} · Qty: {item.quantity}
                          </p>
                          <p className="text-xs font-semibold text-[#191919] mt-0.5">
                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      {/* Review Action for Delivered Orders */}
                      {selectedOrder.status === "Delivered" && (
                        <div className="flex-shrink-0">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] uppercase tracking-wider font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reviewed</span>
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                setReviewingTarget({
                                  orderId: selectedOrder.id,
                                  product: {
                                    id: prodId,
                                    slug: prodSlug,
                                    title: item.product?.title || "Atelier Creation",
                                    image: item.product?.images?.[0],
                                    selectedSize: item.selectedSize,
                                  },
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold transition-all shadow-xs"
                            >
                              <Star className="w-3 h-3 text-[#C29B38] fill-[#C29B38]" />
                              <span>Write Review</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 bg-[#F5F3F0] border border-[#EAE5DF]">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919] mb-3">
                Delivery Address
              </h3>
              <p className="text-xs text-[#77716D] leading-relaxed">{selectedOrder.shippingAddress}</p>
            </div>
          </div>
        ) : (
          /* ── ORDERS LIST VIEW ── */
          <div className="max-w-3xl">
            {orders.length === 0 ? (
              <div className="py-20 text-center border border-[#EAE5DF] bg-[#F5F3F0]">
                <Package className="w-14 h-14 text-[#77716D] mx-auto mb-4" />
                <p className="font-serif text-2xl text-[#77716D] mb-2">No Orders Yet</p>
                <p className="text-xs text-[#77716D] mb-6">
                  Explore our curated collections and place your first atelier order.
                </p>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors"
                >
                  <span>EXPLORE COLLECTIONS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#EAE5DF] border border-[#EAE5DF]">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 bg-[#FDFBF8] hover:bg-[#F5F3F0] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-serif text-base text-[#191919] font-medium">{order.id}</span>
                          <span className={`text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#77716D] mb-0.5">{order.date}</p>
                        <p className="text-xs text-[#77716D]">
                          {order.items?.length || 0} item(s) · ₹{order.total?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#191919] hover:text-[#7B5644] transition-colors"
                      >
                        <span>VIEW DETAILS</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal for Delivered Order Items */}
        {reviewingTarget && (
          <ReviewModal
            isOpen={true}
            onClose={() => setReviewingTarget(null)}
            orderId={reviewingTarget.orderId}
            product={reviewingTarget.product}
            userId={user?.id}
            customerName={selectedOrder?.customer?.name || user?.user_metadata?.full_name || ""}
            customerEmail={selectedOrder?.customer?.email || user?.email || ""}
            onSuccess={(newReview) => {
              setReviewedKeys((prev) => new Set([...prev, `${newReview.orderId}_${newReview.productId}`]));
            }}
          />
        )}
      </section>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-serif">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

