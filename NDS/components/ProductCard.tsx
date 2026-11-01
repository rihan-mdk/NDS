"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/products-data";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedToast, setAddedToast] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.images[0] || FALLBACK_IMAGE);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes[0] || "M");
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col bg-transparent overflow-hidden transition-all duration-300">

      {/* 4:5 Portrait Image Container */}
      <div className="relative aspect-[4/5] w-full bg-[#F5F3F0] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist Button — always visible on mobile, hover on desktop */}
        <button
          suppressHydrationWarning
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FDFBF8]/90 backdrop-blur-xs flex items-center justify-center text-[#191919] hover:text-[#BA1A1A] transition-colors z-10"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
              isFavorited ? "fill-[#BA1A1A] text-[#BA1A1A]" : "text-[#191919]"
            }`}
          />
        </button>

        {/* Hover Action Strip — desktop hover only */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center gap-2 z-10">
          <button
            suppressHydrationWarning
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onQuickView) onQuickView(product);
            }}
            className="flex-1 bg-[#FDFBF8] text-[#191919] text-[10px] uppercase tracking-widest font-semibold py-2.5 hover:bg-[#7B5644] hover:text-[#FDFBF8] transition-colors"
          >
            QUICK VIEW
          </button>
          <button
            suppressHydrationWarning
            onClick={handleQuickAdd}
            aria-label="Add to bag"
            className="bg-[#191919] text-[#FDFBF8] p-2.5 hover:bg-[#7B5644] transition-colors flex items-center justify-center"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Added Notification Pill */}
        {addedToast && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#191919] text-[#FDFBF8] text-[9px] uppercase tracking-widest px-2 py-1 z-20 font-medium">
            Added
          </div>
        )}
      </div>

      {/* Product Content Details */}
      <div className="pt-2.5 sm:pt-4 pb-1.5 sm:pb-2 flex flex-col flex-1 justify-between">
        <div>
          {/* Category label — hidden on very small cards */}
          <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#7B5644] font-medium block mb-0.5 sm:mb-1 truncate">
            {product.subCategory || product.categoryLabel}
          </span>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-[13px] sm:text-base text-[#191919] font-normal leading-snug hover:text-[#7B5644] transition-colors mb-0.5 sm:mb-1 line-clamp-2 sm:line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Fabric description — hidden on mobile to keep cards compact */}
          <p className="hidden sm:block font-sans text-xs text-[#77716D] line-clamp-1 mb-3">
            {product.fabric}
          </p>
        </div>

        <div className="pt-1.5 sm:pt-2 border-t border-[#EAE5DF]/60 flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="font-serif text-[13px] sm:text-base font-medium text-[#191919]">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-[11px] text-[#77716D] line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* DISCOVER link — desktop only, replaced by mobile tap-to-view */}
          <Link
            href={`/product/${product.slug}`}
            className="hidden sm:inline-flex items-center text-[10px] tracking-[0.18em] uppercase font-semibold text-[#191919] group-hover:text-[#7B5644] transition-colors"
          >
            <span>DISCOVER</span>
            <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Mobile: Add-to-bag icon */}
          <button
            suppressHydrationWarning
            onClick={handleQuickAdd}
            aria-label="Add to bag"
            className="sm:hidden text-[#191919] hover:text-[#7B5644] transition-colors p-0.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
