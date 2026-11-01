"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/lib/products-data";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { X, Heart, ShoppingBag, Check } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgSrc, setImgSrc] = useState(product?.images[0] || FALLBACK_IMAGE);

  // Update image when product changes
  React.useEffect(() => {
    if (product?.images[0]) {
      setImgSrc(product.images[0]);
    }
  }, [product]);

  if (!product) return null;

  const availableSizes = product.sizes.filter((s) => s.toLowerCase() !== "custom atelier");
  const activeSize = selectedSize || availableSizes[0] || "M";
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, activeSize);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FDFBF8] border border-[#EAE5DF] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#FDFBF8]/90 flex items-center justify-center text-[#191919] hover:text-[#7B5644] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Column */}
        <div className="w-full md:w-1/2 relative aspect-[3/4] md:aspect-auto bg-[#EFEEEB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgSrc(FALLBACK_IMAGE)}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-2">
              {product.subCategory || product.categoryLabel}
            </span>
            <h2 className="font-serif text-2xl text-[#191919] mb-3 leading-snug">
              {product.title}
            </h2>
            <div className="flex items-baseline space-x-3 mb-4">
              <span className="font-serif text-xl font-semibold text-[#191919]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#77716D] line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-[#77716D] leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#191919] font-medium">
                    Select Size: {activeSize}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        activeSize === size
                          ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                          : "bg-transparent text-[#191919] border-[#EAE5DF] hover:border-[#191919]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6 flex items-center space-x-4">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#191919] font-medium">
                Quantity
              </span>
              <div className="flex items-center border border-[#EAE5DF] bg-[#F5F3F0]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm hover:text-[#7B5644]"
                >
                  -
                </button>
                <span className="px-3 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm hover:text-[#7B5644]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-4 border-t border-[#EAE5DF]">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={added}
                className="flex-1 py-3.5 px-6 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors flex items-center justify-center space-x-2"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className="p-3.5 border border-[#EAE5DF] hover:border-[#191919] transition-colors flex items-center justify-center"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "fill-[#BA1A1A] text-[#BA1A1A]" : "text-[#191919]"
                  }`}
                />
              </button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              onClick={onClose}
              className="block text-center text-[10px] tracking-[0.2em] uppercase text-[#77716D] hover:text-[#191919] transition-colors pt-2"
            >
              View Full Atelier Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

