"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, Truck, CheckCircle2, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Order {
  id: string;
  date: string;
  status: "Confirmed" | "Shipped" | "Delivered" | "Processing";
  items: any[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const targetOrderId = searchParams.get("id");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // 1. Load from localStorage immediately (instant render)
    try {
      const saved = JSON.parse(localStorage.getItem("nds_orders_history") || "[]");
      setOrders(saved);
      if (targetOrderId) {
        const found = saved.find((o: Order) => o.id === targetOrderId);
        if (found) setSelectedOrder(found);
      }
    } catch (e) {
      console.warn("Could not load orders locally:", e);
    }

    // 2. Fetch from Supabase if user is logged in
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
    }
  }, [targetOrderId, user]);

  const statusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-emerald-100 text-emerald-800";
      case "Shipped":   return "bg-blue-100 text-blue-800";
      case "Confirmed": return "bg-[#F5EAE1] text-[#7B5644]";
      case "Processing": return "bg-yellow-100 text-yellow-800";
      default:          return "bg-[#F5F3F0] text-[#77716D]";
    }
  };

  // Tracking steps based on status
  const getTrackingStep = (status: string) => {
    switch (status) {
      case "Confirmed":  return 1;
      case "Processing": return 2;
      case "Shipped":    return 3;
      case "Delivered":  return 4;
      default:           return 1;
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
                  <p className="text-[#191919] font-medium mb-0.5">Total Paid</p>
                  <p className="font-serif text-[#191919] font-semibold">₹{selectedOrder.total?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* 4-Stage Tracking Timeline */}
            <div className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919] mb-6">
                Live Shipment Tracking
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Order Confirmed", icon: CheckCircle2, step: 1 },
                  { label: "Atelier Packing", icon: Package, step: 2 },
                  { label: "In Transit", icon: Truck, step: 3 },
                  { label: "Delivered", icon: Home, step: 4 },
                ].map(({ label, icon: Icon, step }) => {
                  const current = getTrackingStep(selectedOrder.status);
                  const isActive = step <= current;
                  const isCurrent = step === current;
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

            {/* Order Items */}
            <div className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] mb-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#191919] mb-4">
                Items in this Order ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-[#F5F3F0] space-y-0">
                {(selectedOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="py-3 flex gap-3">
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
                    <div className="flex-1">
                      <p className="text-xs font-serif text-[#191919]">{item.product?.title}</p>
                      <p className="text-[11px] text-[#77716D]">Size: {item.selectedSize} · Qty: {item.quantity}</p>
                      <p className="text-xs font-semibold text-[#191919] mt-0.5">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
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

