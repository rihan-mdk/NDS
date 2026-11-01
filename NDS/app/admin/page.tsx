"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllLiveProducts } from "@/lib/products-store";
import { Product } from "@/lib/products-data";
import {
  Package,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface OrderSummary {
  id: string;
  date: string;
  status: "Confirmed" | "Shipped" | "Delivered" | "Processing" | "Pending" | "Cancelled";
  items: any[];
  total: number;
  shippingAddress: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setProducts(getAllLiveProducts());

    try {
      const storedOrders = JSON.parse(
        localStorage.getItem("nds_orders_history") || "[]"
      );
      setOrders(storedOrders);
    } catch (e) {
      console.warn("Could not read orders from storage:", e);
    }

    setMounted(true);
  }, []);

  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "Pending" || o.status === "Processing" || o.status === "Confirmed"
  ).length;

  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Shipped":
        return "bg-sky-50 text-sky-800 border-sky-200";
      case "Confirmed":
        return "bg-[#F5EAE1] text-[#7B5644] border-[#EADACF]";
      case "Processing":
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "Cancelled":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-stone-100 text-stone-600 border-stone-200";
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* ── Page Header & Quick CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1.5">
            ATELIER OVERVIEW
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#191919] font-normal tracking-tight">
            Executive Dashboard
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
            Real-time status of atelier inventory and customer acquisitions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* ── 4 KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Products */}
        <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D]">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3F0] flex items-center justify-center">
              <Package className="w-4 h-4 text-[#7B5644]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal">
              {mounted ? totalProducts : "—"}
            </div>
            <p className="text-[11px] text-[#77716D] mt-1">
              Active across collections
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F5F3F0] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#7B5644]" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal">
              {mounted ? totalOrders : "—"}
            </div>
            <p className="text-[11px] text-[#77716D] mt-1">
              Total placed orders
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D]">
              Pending Fulfillment
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-amber-900 font-normal">
              {mounted ? pendingOrders : "—"}
            </div>
            <p className="text-[11px] text-[#77716D] mt-1">
              Requires atelier action
            </p>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D]">
              Out of Stock
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-700" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl text-red-900 font-normal">
              {mounted ? outOfStockCount : "—"}
            </div>
            <p className="text-[11px] text-[#77716D] mt-1">
              Requires restocking
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Shortcut Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="group p-5 sm:p-6 bg-[#F5F3F0] border border-[#EAE5DF] hover:border-[#7B5644] transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7B5644] font-semibold block mb-1">
              CATALOG MANAGEMENT
            </span>
            <h3 className="font-serif text-lg text-[#191919] group-hover:text-[#7B5644] transition-colors">
              Manage Products &amp; Inventory
            </h3>
            <p className="text-xs text-[#77716D] mt-1">
              Edit pricing, imagery, descriptions, and stock statuses.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#77716D] group-hover:text-[#7B5644] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/orders"
          className="group p-5 sm:p-6 bg-[#F5F3F0] border border-[#EAE5DF] hover:border-[#7B5644] transition-all flex items-center justify-between"
        >
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7B5644] font-semibold block mb-1">
              ORDER FULFILLMENT
            </span>
            <h3 className="font-serif text-lg text-[#191919] group-hover:text-[#7B5644] transition-colors">
              Dispatch &amp; Track Orders
            </h3>
            <p className="text-xs text-[#77716D] mt-1">
              Update shipment statuses and inspect delivery dossiers.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#77716D] group-hover:text-[#7B5644] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* ── Recent Orders Section ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] shadow-xs">
        <div className="p-5 sm:p-6 border-b border-[#EAE5DF] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl text-[#191919] font-normal">
              Recent Client Orders
            </h2>
            <p className="text-xs text-[#77716D] mt-0.5">
              Latest transactions placed across the boutique.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-[#7B5644] hover:text-[#191919] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" />
            <p className="font-serif text-base text-[#191919]">No Orders Placed Yet</p>
            <p className="text-xs text-[#77716D] mt-1">
              Customer orders placed on the storefront will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3F0] border-b border-[#EAE5DF] uppercase tracking-wider text-[10px] text-[#77716D] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Order ID</th>
                  <th className="py-3 px-4 sm:px-6">Client</th>
                  <th className="py-3 px-4 sm:px-6">Date</th>
                  <th className="py-3 px-4 sm:px-6">Amount</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {recentOrders.map((order) => {
                  const clientName =
                    order.customer?.name ||
                    order.shippingAddress.split(",")[0] ||
                    "Atelier Client";

                  return (
                    <tr key={order.id} className="hover:bg-[#FDFBF8] transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-mono text-[11px] text-[#191919] font-semibold">
                        {order.id}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-[#191919] font-medium">
                        {clientName}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-[#77716D]">
                        {order.date}
                      </td>
                      <td className="py-4 px-4 sm:px-6 font-serif text-[#191919]">
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
                        <Link
                          href={`/admin/orders?id=${order.id}`}
                          className="text-[11px] text-[#7B5644] hover:text-[#191919] font-semibold uppercase tracking-wider underline underline-offset-4"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
