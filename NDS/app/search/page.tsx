"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS, getProductsByCategory, Product } from "@/lib/products-data";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { Search as SearchIcon, X, RotateCcw, Sparkles } from "lucide-react";

const DEFAULT_POPULAR_TAGS = [
  "Bridal Lehengas",
  "Silk Sarees",
  "Short Kurtis",
  "Anarkalis",
  "Kundan Jewellery",
  "Zardozi Clutches",
  "Heritage Velvet",
];

const FILTER_CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "lehenga", label: "Couture Lehengas" },
  { id: "gown", label: "Evening Gowns" },
  { id: "short-kurti", label: "Short Kurtis" },
  { id: "pakistani", label: "Pakistani Suits" },
  { id: "korean", label: "Korean Modern" },
  { id: "accessories", label: "Fine Accessories" },
];

export default function SearchPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Kundan Ring",
    "Ivory Drape Gown",
    "Raw Silk Kurti",
    "Bridal Lehenga",
  ]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nds_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load recent searches:", e);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem("nds_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save recent search:", e);
    }
  };

  const removeRecentChip = (chip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== chip);
    setRecentSearches(updated);
    try {
      localStorage.setItem("nds_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not remove chip:", e);
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem("nds_recent_searches");
    } catch (e) {
      console.warn("Could not clear recent searches:", e);
    }
  };

  const handleClearOrClose = () => {
    if (query) {
      setQuery("");
      setActiveFilter("all");
      inputRef.current?.focus();
    } else {
      router.back();
    }
  };

  // Keyboard Escape listener (works everywhere on the search page)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (query) {
          setQuery("");
          setActiveFilter("all");
          inputRef.current?.focus();
        } else {
          router.back();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, router]);

  // Filtered Results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    let pool = getProductsByCategory("all") || PRODUCTS;

    if (activeFilter !== "all") {
      if (activeFilter === "accessories") {
        pool = pool.filter((p) => p.isAccessory || p.category === "bracelets" || p.category === "clutches" || p.category === "rings");
      } else {
        pool = pool.filter((p) => p.category === activeFilter);
      }
    }

    if (!q) return pool;

    return pool.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.embroidery.toLowerCase().includes(q)
    );
  }, [query, activeFilter]);

  const featuredCurations = useMemo(() => {
    return PRODUCTS.filter((p) => p.featured || p.newArrival).slice(0, 4);
  }, []);

  const handleExecuteSearch = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
  };

  const handleClear = () => {
    setQuery("");
    setActiveFilter("all");
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="w-full bg-[#FDFBF8] min-h-[calc(100vh-3.5rem)] text-[#191919]">
      {/* ── Central Editorial Search Field ── */}
      <section className="w-full px-4 sm:px-10 lg:px-14 py-8 sm:py-12 border-b border-[#EAE5DF]">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-full relative flex items-center bg-[#F5F3F0] rounded-full transition-all duration-300 focus-within:bg-[#EFEEEB] focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#EAE5DF]">
            <SearchIcon className="text-[#77716D] ml-5 sm:ml-6 mr-3 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  saveRecentSearch(query);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  handleClearOrClose();
                }
              }}
              placeholder="Search products, collections and styles..."
              spellCheck="false"
              className="w-full py-3.5 sm:py-4 pr-16 bg-transparent text-xs sm:text-sm text-[#191919] placeholder:text-[#77716D] focus:outline-none tracking-wide"
            />
            <div className="absolute right-3.5 sm:right-4 flex items-center gap-1.5 sm:gap-2">
              {query && (
                <button
                  type="button"
                  onClick={handleClearOrClose}
                  aria-label="Clear search"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[#77716D] hover:text-[#191919] hover:bg-[#EAE5DF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClearOrClose}
                title="Press ESC to clear search or go back"
                className="hidden md:flex items-center px-2 py-0.5 rounded bg-[#EAE5DF] hover:bg-[#DDD8D0] text-[#77716D] hover:text-[#191919] text-[10px] tracking-wider font-mono select-none transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRE-SEARCH / DEFAULT DISCOVERY STATE ── */}
      {!isSearching && (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-14 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
          {/* Recent Searches Block */}
          {recentSearches.length > 0 && (
            <div className="w-full flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] uppercase text-[#7B5644] tracking-[0.2em] font-semibold">
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllRecent}
                  className="font-sans text-[10px] text-[#77716D] hover:text-[#191919] transition-colors uppercase tracking-widest font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {recentSearches.map((chip) => (
                  <div
                    key={chip}
                    onClick={() => handleExecuteSearch(chip)}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-[#F5F3F0] hover:bg-[#EFEEEB] text-[#191919] rounded-full transition-colors cursor-pointer text-xs border border-[#EAE5DF]"
                  >
                    <span>{chip}</span>
                    <button
                      type="button"
                      onClick={(e) => removeRecentChip(chip, e)}
                      aria-label={`Remove ${chip}`}
                      className="text-[#77716D] hover:text-[#191919] flex items-center p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches Block */}
          <div className="w-full flex flex-col gap-3">
            <span className="font-sans text-[10px] uppercase text-[#7B5644] tracking-[0.2em] font-semibold">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleExecuteSearch(tag)}
                  className="px-3.5 py-1.5 bg-[#F5F3F0] hover:bg-[#EFEEEB] text-[#191919] text-xs rounded-full transition-colors border border-[#EAE5DF]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Atelier Curations */}
          <div className="w-full pt-4 flex flex-col gap-4 border-t border-[#EAE5DF]">
            <div className="flex items-baseline justify-between">
              <span className="font-sans text-[10px] uppercase text-[#7B5644] tracking-[0.2em] font-semibold">
                Featured Atelier Curations
              </span>
              <span className="text-[10px] text-[#77716D] uppercase tracking-wider hidden sm:inline">
                Spring / Festive 2025
              </span>
            </div>

            {/* 2-Column Mobile, 4-Column Desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
              {featuredCurations.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LIVE SEARCH RESULTS VIEW ── */}
      {isSearching && (
        <section className="w-full max-w-5xl mx-auto px-4 sm:px-10 lg:px-14 py-8 sm:py-10 flex flex-col gap-6">
          {/* Query Metadata Bar */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-[#EAE5DF]">
            <span className="text-xs sm:text-sm text-[#191919]">
              Showing <strong className="font-semibold">{results.length}</strong> results for{" "}
              <span className="font-serif italic text-[#7B5644] font-medium">&ldquo;{query}&rdquo;</span>
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-[10px] uppercase tracking-widest text-[#77716D] hover:text-[#191919] transition-colors flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide flex-nowrap sm:flex-wrap">
            <span className="text-[10px] uppercase text-[#7B5644] tracking-[0.2em] font-semibold mr-1 flex-shrink-0 hidden sm:inline">
              Filter By:
            </span>
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeFilter === cat.id
                    ? "bg-[#191919] text-[#FDFBF8] font-semibold"
                    : "bg-[#F5F3F0] text-[#77716D] hover:text-[#191919] border border-[#EAE5DF]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
              {results.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            /* No Results Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-14 h-14 rounded-full bg-[#F5F3F0] flex items-center justify-center mb-4 text-[#77716D] border border-[#EAE5DF]">
                <SearchIcon className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#191919] mb-2 font-normal">
                No couture pieces found matching{" "}
                <span className="italic text-[#7B5644]">&ldquo;{query}&rdquo;</span>
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#77716D] max-w-md mb-6 leading-relaxed">
                Please verify your spelling or explore bridal collections, fine jewellery, and heritage silks from our curations below.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {DEFAULT_POPULAR_TAGS.slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleExecuteSearch(tag)}
                    className="px-3.5 py-1.5 bg-[#F5F3F0] hover:bg-[#EFEEEB] text-[#191919] text-xs rounded-full transition-colors border border-[#EAE5DF]"
                  >
                    {tag}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-1.5 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold rounded-full hover:bg-[#7B5644] transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
