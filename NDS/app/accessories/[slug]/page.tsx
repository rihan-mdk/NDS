"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTS, ACCESSORIES_CATEGORIES, Product } from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { SlidersHorizontal, ArrowLeft, Grid3X3, LayoutGrid } from "lucide-react";

export default function AccessoryCategoryDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || "bracelets";
  const [sortBy, setSortBy] = useState<string>("price-low");
  const [gridColumns, setGridColumns] = useState<3 | 4>(4);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categoryMeta = ACCESSORIES_CATEGORIES.find((c) => c.slug === slug) || {
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " "),
    count: 6,
    description: "Handcrafted heirloom accessories designed to accompany imperial couture.",
  };

  let items = PRODUCTS.filter((p) => p.category === slug || (slug === "all" && p.isAccessory));
  if (items.length === 0) {
    items = PRODUCTS.filter((p) => p.isAccessory || ["bracelets", "clutches", "rings"].includes(p.category));
  }

  if (sortBy === "price-low") {
    items = [...items].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    items = [...items].sort((a, b) => b.price - a.price);
  }

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Category Header & Breadcrumb */}
      <section className="w-full px-4 sm:px-10 lg:px-14 pt-6 sm:pt-10 pb-5 sm:pb-8 bg-[#FDFBF8] border-b border-[#EAE5DF]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6">
          <div className="flex flex-col space-y-2 sm:space-y-3 max-w-2xl">
            {/* Breadcrumb Navigation: Accessories -> Selected Accessory Products */}
            <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[11px] uppercase tracking-widest text-[#77716D]">
              <Link href="/" className="hover:text-[#191919] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link href="/accessories" className="hover:text-[#191919] transition-colors">
                Accessories
              </Link>
              <span>/</span>
              <span className="text-[#191919] font-medium truncate max-w-[140px] sm:max-w-none">{categoryMeta.name}</span>
            </nav>

            <div className="flex items-baseline gap-3 sm:gap-4 pt-1 flex-wrap">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl tracking-tight text-[#191919]">
                {categoryMeta.name}
              </h1>
              <span className="text-[10px] text-[#7B5644] uppercase tracking-[0.2em] bg-[#EAE8E5] px-3 py-1 font-semibold whitespace-nowrap">
                {items.length} Styles
              </span>
            </div>

            <p className="font-sans text-sm text-[#77716D] leading-relaxed pt-1 hidden sm:block">
              {categoryMeta.description}
            </p>
          </div>

          {/* Grid Layout Toggle — desktop only */}
          <div className="hidden sm:flex items-center space-x-3 self-start md:self-end">
            <span className="text-[10px] text-[#77716D] uppercase tracking-widest hidden sm:inline">
              Grid Layout
            </span>
            <div className="flex items-center bg-[#F5F3F0] p-1 gap-1 border border-[#EAE5DF]">
              <button
                onClick={() => setGridColumns(3)}
                aria-label="3 Columns View"
                className={`p-1.5 transition-colors ${
                  gridColumns === 3 ? "bg-[#FDFBF8] text-[#191919] shadow-xs" : "text-[#77716D] hover:text-[#191919]"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridColumns(4)}
                aria-label="4 Columns View"
                className={`p-1.5 transition-colors ${
                  gridColumns === 4 ? "bg-[#FDFBF8] text-[#191919] shadow-xs" : "text-[#77716D] hover:text-[#191919]"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar — horizontal scroll on mobile, wrap on desktop */}
        <div className="pt-3 sm:pt-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap flex-nowrap scrollbar-hide">
            <Link
              href="/accessories"
              className="px-3 sm:px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors whitespace-nowrap flex-shrink-0 bg-[#F5F3F0] text-[#191919] hover:bg-[#EFEEEB]"
            >
              All Categories
            </Link>
            {ACCESSORIES_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/accessories/${cat.slug}`}
                className={`px-3 sm:px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors whitespace-nowrap flex-shrink-0 ${
                  cat.slug === slug
                    ? "bg-[#191919] text-[#FDFBF8]"
                    : "bg-[#F5F3F0] text-[#191919] hover:bg-[#EFEEEB]"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#77716D] hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F5F3F0] border border-[#EAE5DF] text-[10px] sm:text-xs py-2 px-2 sm:px-3 focus:outline-none uppercase tracking-wider text-[#191919]"
            >
              <option value="price-low">Price ↑</option>
              <option value="price-high">Price ↓</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product Grid — Strict 2-column mobile grid, 4:5 image ratio cards */}
      <section className="w-full px-4 sm:px-10 lg:px-14 py-6 sm:py-12">
        <div
          className={`grid gap-3 sm:gap-6 grid-cols-2 ${
            gridColumns === 3
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}

