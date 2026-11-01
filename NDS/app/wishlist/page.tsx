"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Check } from "lucide-react";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movedId, setMovedId] = useState<string | null>(null);

  const handleMoveToBag = (product: any) => {
    addToCart(product, 1, product.sizes[0] || "M");
    removeFromWishlist(product.id);
    setMovedId(product.id);
    setTimeout(() => setMovedId(null), 2000);
  };

  const handleMoveAll = () => {
    items.forEach((p) => {
      addToCart(p, 1, p.sizes[0] || "M");
    });
    clearWishlist();
  };

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[70vh] bg-[#FDFBF8] flex flex-col items-center justify-center px-6 py-20 text-center">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold mb-3">
          PERSONAL VAULT
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#191919] mb-4">
          Your Wishlist is Empty
        </h1>
        <p className="font-sans text-sm text-[#77716D] max-w-md mb-8 leading-relaxed">
          Curate your favorite bridal ensembles, architectural gowns, and fine jewels to save for special occasions.
        </p>
        <Link
          href="/categories"
          className="inline-flex items-center px-8 py-4 bg-[#191919] text-[#FDFBF8] text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#7B5644] transition-colors"
        >
          <span>EXPLORE ATELIER</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* Header */}
      <section className="w-full px-6 sm:px-10 lg:px-14 pt-10 pb-6 border-b border-[#EAE5DF]">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-[#77716D] mb-4">
          <Link href="/" className="hover:text-[#191919] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-[#191919]">Saved Wardrobe</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#191919]">
              Wishlist &amp; Curation Vault
            </h1>
            <p className="font-sans text-xs text-[#77716D] mt-1">
              {items.length} bespoke pieces reserved in your capsule
            </p>
          </div>

          <button
            onClick={handleMoveAll}
            className="py-3 px-6 bg-[#191919] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors"
          >
            MOVE ALL TO SHOPPING BAG
          </button>
        </div>
      </section>

      {/* Grid of Wishlist Items */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-[3/4] w-full bg-[#EFEEEB] overflow-hidden">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";
                    }}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  />
                </Link>

                <button
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FDFBF8]/90 flex items-center justify-center text-[#77716D] hover:text-[#BA1A1A] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Content */}
              <div className="p-5 flex flex-col flex-1 justify-between bg-[#FDFBF8]">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-medium block mb-1">
                    {product.categoryLabel}
                  </span>
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-serif text-base text-[#191919] hover:text-[#7B5644] transition-colors font-medium mb-1 line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#77716D] line-clamp-1 mb-3">
                    {product.fabric}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE5DF]">
                  <div className="flex justify-between items-baseline mb-3">
                    <span className="font-serif text-lg font-semibold text-[#191919]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full py-2.5 px-4 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[10px] uppercase tracking-widest font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {movedId === product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Transferred to Bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

