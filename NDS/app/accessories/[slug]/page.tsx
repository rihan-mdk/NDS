"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTS, ACCESSORIES_CATEGORIES, getProductsByCategory, Product } from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { SlidersHorizontal, ArrowLeft } from "lucide-react";

export default function AccessoryCategoryDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || "bracelets";
  const [sortBy, setSortBy] = useState<string>("price-low");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categoryMetaFromList = ACCESSORIES_CATEGORIES.find((c) => c.slug === slug);
  const displayName =
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") + " Collection";
  const categoryMeta = {
    slug,
    name: displayName,
    count: categoryMetaFromList?.count ?? 6,
    description:
      categoryMetaFromList?.description ??
      "Handcrafted heirloom accessories designed to accompany imperial couture.",
  };

  let items = getProductsByCategory(slug);
  if (items.length === 0) {
    items = getProductsByCategory("all").filter((p) => p.isAccessory || ["bracelets", "clutches", "rings"].includes(p.category));
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

          {/* Grid Layout Toggle removed */}
        </div>

        {/* Filter Bar — sort only, no category pills */}
        <div className="pt-3 sm:pt-4 flex items-center justify-end gap-3 sm:gap-4">
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
        <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
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

