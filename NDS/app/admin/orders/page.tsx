"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  User,
  MapPin,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  product: {
    id: string;
    title: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  selectedSize: string;
}

interface OrderRecord {
  id: string;
  date: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

const ORDER_STATUSES: OrderRecord["status"][] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function OrdersManagementContent() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get("id");

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<OrderRecord["status"]>("Confirmed");
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [initialSelectedId]);

  const loadOrders = async () => {
    // 1. Instant render from localStorage
    try {
      const stored = JSON.parse(
        localStorage.getItem("nds_orders_history") || "[]"
      );
      setOrders(stored);

      if (initialSelectedId) {
        const match = stored.find((o: OrderRecord) => o.id === initialSelectedId);
        if (match) {
          setSelectedOrder(match);
          setStatusUpdating(match.status);
        }
      }
    } catch (e) {
      console.warn("Could not load orders from localStorage:", e);
    }

    // 2. Fetch from Supabase and replace with fresh data
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
          if (initialSelectedId) {
            const match = data.orders.find((o: OrderRecord) => o.id === initialSelectedId);
            if (match) {
              setSelectedOrder(match);
              setStatusUpdating(match.status);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not load orders from cloud:", e);
    }
  };

  const handleOpenOrder = (order: OrderRecord) => {
    setSelectedOrder(order);
    setStatusUpdating(order.status);
    setSaveToast(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      // Update local state and localStorage
      const updatedList = orders.map((o) =>
        o.id === selectedOrder.id ? { ...o, status: statusUpdating } : o
      );
      localStorage.setItem("nds_orders_history", JSON.stringify(updatedList));
      setOrders(updatedList);
      setSelectedOrder({ ...selectedOrder, status: statusUpdating });

      // Persist to Supabase
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedOrder.id, status: statusUpdating }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("nds_orders_updated"));
      }

      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (e) {
      console.error("Could not update order status:", e);
    }
  };

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Shipped":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Confirmed":
        return "bg-[#F5EAE1] text-[#7B5644] border-[#EADACF]";
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Cancelled":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = (order.customer?.name || order.shippingAddress)
        .toLowerCase()
        .includes(q);
      const matchEmail = (order.customer?.email || "").toLowerCase().includes(q);
      if (!matchId && !matchName && !matchEmail) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Page Header ── */}
      <div className="pb-6 border-b border-[#EAE5DF]">
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
          FULFILLMENT &amp; LOGISTICS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal tracking-tight">
          Client Orders
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
          Review placed orders, verify customer shipping dossiers, and update fulfillment tracking.
        </p>
      </div>

      {/* ── Search & Status Filter Bar ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F3F0] border border-[#EAE5DF] pl-10 pr-4 py-2.5 text-xs text-[#191919] placeholder-[#77716D] focus:outline-none focus:border-[#7B5644]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77716D] hover:text-[#191919]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors border ${
              statusFilter === "all"
                ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                : "bg-[#F5F3F0] text-[#77716D] border-[#EAE5DF] hover:text-[#191919]"
            }`}
          >
            All ({orders.length})
          </button>
          {ORDER_STATUSES.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors border ${
                  statusFilter === status
                    ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                    : "bg-[#F5F3F0] text-[#77716D] border-[#EAE5DF] hover:text-[#191919]"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE5DF] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#191919] uppercase tracking-wider">
            Showing {filteredOrders.length} Order{filteredOrders.length === 1 ? "" : "s"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#77716D]">
            Order Book
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" />
            <p className="font-serif text-lg text-[#191919]">No Orders Found</p>
            <p className="text-xs text-[#77716D] mt-1 mb-4">
              No transactions match your current search or status filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 bg-[#F5F3F0] text-[#191919] text-xs uppercase tracking-wider font-semibold hover:bg-[#EAE8E5]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3F0] border-b border-[#EAE5DF] uppercase tracking-wider text-[10px] text-[#77716D] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Order ID</th>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4 sm:px-6">Client / Contact</th>
                  <th className="py-3 px-4 sm:px-6">Items</th>
                  <th className="py-3 px-4 sm:px-6">Total Amount</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {filteredOrders.map((order) => {
                  const clientName =
                    order.customer?.name ||
                    order.shippingAddress?.split(",")?.[0] ||
                    "Atelier Client";
                  const clientEmail = order.customer?.email || "";

                  return (
                    <tr key={order.id} className="hover:bg-[#FDFBF8] transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-mono text-xs text-[#191919] font-semibold">
                        {order.id}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-[#77716D] whitespace-nowrap">
                        {order.date}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-medium text-[#191919]">{clientName}</div>
                        {clientEmail && (
                          <div className="text-[11px] text-[#77716D] truncate max-w-xs">
                            {clientEmail}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-[#77716D]">
                        {order.items?.length || 0} Piece{order.items?.length === 1 ? "" : "s"}
                      </td>

                      <td className="py-4 px-4 sm:px-6 font-serif text-sm text-[#191919] font-medium whitespace-nowrap">
                        ₹{order.total?.toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleOpenOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3F0] hover:bg-[#EAE8E5] text-[#191919] text-[10px] uppercase tracking-wider font-semibold border border-[#EAE5DF] transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Details Slide-over / Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FDFBF8] border border-[#EAE5DF] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 relative">

            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#EAE5DF]">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-0.5">
                  ORDER DOSSIER
                </span>
                <h2 className="font-serif text-2xl text-[#191919] font-normal">
                  {selectedOrder.id}
                </h2>
                <p className="text-xs text-[#77716D] mt-0.5">
                  Placed on {selectedOrder.date} · Paid via {selectedOrder.paymentMethod || "PREPAID"}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0] rounded-xs"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Update Control */}
            <div className="p-4 sm:p-5 bg-[#FFFFFF] border border-[#EAE5DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D] block mb-1">
                  Update Fulfillment Status
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={statusUpdating}
                    onChange={(e) => setStatusUpdating(e.target.value as any)}
                    className="bg-[#F5F3F0] border border-[#EAE5DF] px-3 py-2 text-xs font-semibold text-[#191919] focus:outline-none focus:border-[#7B5644]"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-xs uppercase tracking-wider font-semibold transition-colors"
                  >
                    Save Status
                  </button>
                </div>
              </div>

              {saveToast && (
                <div className="text-xs text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Status updated successfully</span>
                </div>
              )}
            </div>

            {/* Customer & Delivery Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="p-4 bg-[#FFFFFF] border border-[#EAE5DF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#191919] border-b border-[#EAE5DF] pb-2">
                  <User className="w-3.5 h-3.5 text-[#7B5644]" />
                  <span>Customer Information</span>
                </div>
                <div className="text-xs space-y-1 text-[#77716D]">
                  <p>
                    <strong className="text-[#191919]">Name:</strong>{" "}
                    {selectedOrder.customer?.name ||
                      selectedOrder.shippingAddress?.split(",")?.[0] ||
                      "Atelier Client"}
                  </p>
                  {selectedOrder.customer?.email && (
                    <p>
                      <strong className="text-[#191919]">Email:</strong>{" "}
                      {selectedOrder.customer.email}
                    </p>
                  )}
                  {selectedOrder.customer?.phone && (
                    <p>
                      <strong className="text-[#191919]">Phone:</strong>{" "}
                      {selectedOrder.customer.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 bg-[#FFFFFF] border border-[#EAE5DF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#191919] border-b border-[#EAE5DF] pb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#7B5644]" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-xs space-y-1 text-[#77716D]">
                  {selectedOrder.customer?.address ? (
                    <>
                      <p className="text-[#191919]">{selectedOrder.customer.address}</p>
                      <p>
                        {selectedOrder.customer.city}, {selectedOrder.customer.state} -{" "}
                        {selectedOrder.customer.pincode}
                      </p>
                    </>
                  ) : (
                    <p className="leading-relaxed">{selectedOrder.shippingAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#191919]">
                Ordered Pieces ({selectedOrder.items?.length || 0})
              </h3>
              <div className="divide-y divide-[#EAE5DF] border border-[#EAE5DF] bg-[#FFFFFF]">
                {(selectedOrder.items || []).map((item, idx) => {
                  const img = item.product?.images?.[0];
                  return (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {img && (
                          <div className="w-12 h-15 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden aspect-[4/5] flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={item.product?.title || "Product"}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-serif text-xs text-[#191919]">
                            {item.product?.title}
                          </p>
                          <p className="text-[11px] text-[#77716D] mt-0.5">
                            Size: <span className="font-semibold text-[#191919]">{item.selectedSize}</span> · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="font-serif text-xs text-[#191919] font-medium text-right whitespace-nowrap">
                        ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EAE5DF] text-sm">
              <span className="font-sans text-xs uppercase tracking-wider text-[#77716D] font-semibold">
                Total Order Amount:
              </span>
              <span className="font-serif text-xl font-normal text-[#191919]">
                ₹{selectedOrder.total?.toLocaleString("en-IN")}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#77716D]">Loading orders...</div>}>
      <OrdersManagementContent />
    </Suspense>
  );
}

