"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllLiveProducts,
  saveProductToStorage,
  deleteProductFromStorage,
  getDeletedIdsFromStorage,
} from "@/lib/products-store";
import { Product } from "@/lib/products-data";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "clothing" | "accessory">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    // 1. Immediate local state for instant rendering
    setProducts(getAllLiveProducts());

    // 2. Fetch live data from Supabase API
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const deletedIds = new Set(getDeletedIdsFromStorage());
          setProducts(data.products.filter((p: Product) => !deletedIds.has(p.id)));
        }
      }
    } catch (e) {
      console.warn("Failed to load products from API:", e);
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated: Product = { ...product, inStock: !product.inStock };
    saveProductToStorage(updated);

    // Also update server storage
    try {
      await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn("Server sync error:", e);
    }

    loadProducts();
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    const deleteId = productToDelete.id;

    // 1. Remove from local storage immediately
    deleteProductFromStorage(deleteId);

    // 2. Delete on server (Supabase & local backup)
    try {
      await fetch(`/api/admin/products?id=${deleteId}`, {
        method: "DELETE",
      });
    } catch (e) {
      console.warn("Server sync error:", e);
    }

    setIsDeleting(false);
    setProductToDelete(null);
    await loadProducts();
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Type filter
    if (typeFilter === "clothing" && product.isAccessory) return false;
    if (typeFilter === "accessory" && !product.isAccessory) return false;

    // Category filter
    if (categoryFilter !== "all" && product.category !== categoryFilter) return false;

    // Stock filter
    if (stockFilter === "inStock" && !product.inStock) return false;
    if (stockFilter === "outOfStock" && product.inStock) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }

    return true;
  });

  const categories = [
    { label: "All Categories", value: "all" },
    { label: "Korean", value: "korean" },
    { label: "Short Kurti", value: "short-kurti" },
    { label: "Pakistani", value: "pakistani" },
    { label: "Lehenga", value: "lehenga" },
    { label: "Gown", value: "gown" },
    { label: "Party Wear", value: "party-wear" },
    { label: "Co-ord Set", value: "co-ord-set" },
    { label: "Jeans", value: "jeans" },
    { label: "Bracelets", value: "bracelets" },
    { label: "Clutches", value: "clutches" },
    { label: "Rings", value: "rings" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* ── Top Header & Add Product CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
            CATALOG MANAGEMENT
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal tracking-tight">
            Atelier Products
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
            Manage your boutique silhouettes, bridal edits, and high jewelry pieces.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search by title, collection, or material..."
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

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAE5DF]">
          {/* Type Tabs: All, Clothing, Accessories */}
          <div className="flex items-center bg-[#F5F3F0] p-1 gap-1 border border-[#EAE5DF] text-xs">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] font-semibold transition-colors ${
                typeFilter === "all"
                  ? "bg-[#191919] text-[#FDFBF8]"
                  : "text-[#77716D] hover:text-[#191919]"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter("clothing")}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] font-semibold transition-colors ${
                typeFilter === "clothing"
                  ? "bg-[#191919] text-[#FDFBF8]"
                  : "text-[#77716D] hover:text-[#191919]"
              }`}
            >
              Clothing
            </button>
            <button
              onClick={() => setTypeFilter("accessory")}
              className={`px-3 py-1.5 uppercase tracking-wider text-[10px] font-semibold transition-colors ${
                typeFilter === "accessory"
                  ? "bg-[#191919] text-[#FDFBF8]"
                  : "text-[#77716D] hover:text-[#191919]"
              }`}
            >
              Accessories
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] font-semibold">
                Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F5F3F0] border border-[#EAE5DF] px-3 py-1.5 text-xs text-[#191919] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] font-semibold">
                Stock:
              </span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-[#F5F3F0] border border-[#EAE5DF] px-3 py-1.5 text-xs text-[#191919] focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="inStock">Available</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products List Table (Desktop) & Cards (Mobile) ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE5DF] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#191919] uppercase tracking-wider">
            Showing {filteredProducts.length} Product{filteredProducts.length === 1 ? "" : "s"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#77716D]">
            Live Inventory
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <AlertCircle className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" />
            <p className="font-serif text-lg text-[#191919]">No Products Match Filters</p>
            <p className="text-xs text-[#77716D] mt-1 mb-4">
              Try adjusting your search query or category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setCategoryFilter("all");
                setStockFilter("all");
              }}
              className="px-4 py-2 bg-[#F5F3F0] text-[#191919] text-xs uppercase tracking-wider font-semibold hover:bg-[#EAE8E5]"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3F0] border-b border-[#EAE5DF] uppercase tracking-wider text-[10px] text-[#77716D] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Product</th>
                  <th className="py-3 px-4 sm:px-6">Category</th>
                  <th className="py-3 px-4 sm:px-6">Price</th>
                  <th className="py-3 px-4 sm:px-6">Sizes / Fitting</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Availability</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FDFBF8] transition-colors">
                    {/* Image + Title */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-15 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden flex-shrink-0 relative aspect-[4/5]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-serif text-xs sm:text-sm text-[#191919] font-normal truncate">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-[#77716D] uppercase tracking-wider">
                              {p.subCategory || p.categoryLabel}
                            </span>
                            {p.newArrival && (
                              <span className="text-[8px] uppercase tracking-widest bg-[#191919] text-[#FDFBF8] px-1.5 py-0.2 font-semibold">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold bg-[#F5F3F0] text-[#7B5644] border border-[#EAE5DF]">
                        {p.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-serif text-sm text-[#191919]">
                        ₹{p.price.toLocaleString("en-IN")}
                      </div>
                      {p.originalPrice && (
                        <div className="text-[10px] text-[#77716D] line-through">
                          ₹{p.originalPrice.toLocaleString("en-IN")}
                        </div>
                      )}
                    </td>

                    {/* Sizes / Fitting info */}
                    <td className="py-4 px-4 sm:px-6 text-[#77716D]">
                      {p.isAccessory ? (
                        <span className="text-[11px] italic">
                          {p.category === "rings"
                            ? "Adjustable Band"
                            : p.category === "bracelets"
                            ? "Wrist Cuff Fit"
                            : "Standard Dimensions"}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.sizes.slice(0, 5).map((size) => (
                            <span
                              key={size}
                              className="text-[9px] uppercase px-1.5 py-0.5 bg-[#F5F3F0] text-[#191919] font-semibold border border-[#EAE5DF]"
                            >
                              {size}
                            </span>
                          ))}
                          {p.sizes.length > 5 && (
                            <span className="text-[9px] text-[#77716D]">
                              +{p.sizes.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Availability toggle */}
                    <td className="py-4 px-4 sm:px-6 text-center">
                      <button
                        onClick={() => handleToggleStock(p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-wider font-semibold border transition-all ${
                          p.inStock
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                        }`}
                        title="Click to toggle availability"
                      >
                        {p.inStock ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Storefront PDP preview */}
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          title="Preview on Storefront"
                          className="p-1.5 text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0] rounded-xs transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          title="Edit Product"
                          className="p-1.5 text-[#7B5644] hover:text-[#191919] hover:bg-[#F5F3F0] rounded-xs transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setProductToDelete(p)}
                          title="Delete Product"
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-red-700 font-semibold block mb-1">
                CONFIRM DELETION
              </span>
              <h3 className="font-serif text-xl sm:text-2xl text-[#191919] font-normal">
                Delete this product?
              </h3>
            </div>

            <p className="text-xs text-[#77716D] leading-relaxed">
              This action will permanently remove{" "}
              <strong className="text-[#191919]">&quot;{productToDelete.title}&quot;</strong>{" "}
              from the active boutique collection and customer storefront.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-[#F5F3F0] hover:bg-[#EAE8E5] text-[#191919] text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-700 hover:bg-red-800 text-[#FDFBF8] text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

