"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS, getProductBySlug, Product } from "@/lib/products-data";
import { getLiveProductBySlug } from "@/lib/products-store";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  Heart,
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Star,
  X,
} from "lucide-react";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || "zari-embroidered-azure-silk-kurti";

  const [product, setProduct] = useState<Product>(() => getProductBySlug(slug) || PRODUCTS[0]);

  useEffect(() => {
    const live = getLiveProductBySlug(slug);
    if (live) {
      setProduct(live);
      if (live.sizes && live.sizes.length > 0) {
        setSelectedSize(live.sizes[0]);
      }
    }

    // Also fetch from cloud API in case the product was created on another system
    async function fetchCloudProduct() {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          const match = data.products?.find((p: Product) => p.slug === slug);
          if (match) {
            setProduct(match);
            if (match.sizes && match.sizes.length > 0) {
              setSelectedSize(match.sizes[0]);
            }
          }
        }
      } catch (e) {}
    }
    fetchCloudProduct();
  }, [slug]);

  const isAccessory = Boolean(
    product.isAccessory ||
    ["bracelets", "clutches", "rings"].includes(product.category) ||
    product.categoryLabel?.toLowerCase().includes("accessories")
  );

  const availableSizes = (product.sizes || []).filter(
    (s) => s.toLowerCase() !== "custom atelier"
  );

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    isAccessory
      ? product.category === "rings"
        ? "Adjustable"
        : "One Size"
      : availableSizes[0] || "M"
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<"spec" | "care" | "shipping" | null>("spec");
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize);
    router.push("/checkout");
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  // Curated pair recommendations
  let relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (isAccessory ? p.isAccessory : !p.isAccessory)
  ).slice(0, 4);

  if (relatedProducts.length < 4) {
    relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  }

  return (
    <div className="w-full bg-[#FDFBF8] min-h-screen">
      {/* ── Breadcrumb Navigation (Desktop & Tablet) ── */}
      <div className="hidden sm:block w-full px-4 sm:px-10 lg:px-14 py-3 sm:py-4 border-b border-[#EAE5DF] bg-[#FDFBF8]">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-[#77716D]">
            <Link href="/" className="hover:text-[#191919] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link
              href={isAccessory ? `/accessories/${product.category}` : `/categories/${product.category}`}
              className="hover:text-[#191919] transition-colors"
            >
              {product.categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[#191919] font-medium truncate max-w-[140px] sm:max-w-none">
              {product.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main 2-Column Product Showcase ── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-3 sm:py-6 lg:py-8">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 xl:gap-14 items-start">

          {/* ════ LEFT COLUMN: Product Visual Gallery (~55% width on desktop) ════ */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 max-w-[440px] lg:max-w-[530px] mx-auto lg:mx-0 w-full">

            {/* Main Stage Image Container (Strict 4:5 Portrait Ratio, Natural Unzoomed Framing) */}
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 5",
                height: "auto",
              }}
              className="relative w-full aspect-[4/5] h-auto max-h-[70vh] bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[selectedImage] || product.images[0] || FALLBACK_IMAGE}
                alt={product.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01] ${
                  isAccessory ? "object-center" : "object-top"
                }`}
              />

              {product.newArrival && (
                <span className="absolute top-4 left-4 bg-[#191919] text-[#FDFBF8] text-[9px] uppercase tracking-widest px-2.5 py-1 font-semibold z-10">
                  New Arrival
                </span>
              )}

              {/* Minimalist Floating Wishlist Heart */}
              <button
                onClick={handleWishlistToggle}
                aria-label={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
                className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-10 h-10 rounded-full bg-[#FDFBF8]/90 backdrop-blur-xs flex items-center justify-center text-[#191919] hover:text-[#BA1A1A] transition-colors shadow-xs z-10"
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    isFavorited ? "fill-[#BA1A1A] text-[#BA1A1A] scale-110" : "text-[#191919]"
                  }`}
                />
              </button>

              {/* Mobile pagination dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 sm:hidden z-10">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        selectedImage === idx ? "bg-[#FDFBF8] w-4" : "bg-[#FDFBF8]/50 w-1.5"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Desktop & Tablet only; on mobile, pagination dots keep the 4:5 image clean and direct) */}
            {product.images.length > 1 && (
              <div className="hidden sm:flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 bg-[#F5F3F0] border overflow-hidden transition-all ${
                      selectedImage === idx
                        ? "border-[#191919] ring-1 ring-[#191919]"
                        : "border-[#EAE5DF] opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`View ${idx + 1}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop Left-Side Badges & Accordions (Untouched on Desktop, hidden on mobile) */}
            <div className="hidden lg:flex flex-col gap-4 w-full">
              {/* Atelier Assurance Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 px-3 sm:px-6 bg-[#F5F3F0] border border-[#EAE5DF]">
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    {isAccessory ? "22K Gold & Polki" : "Pure Mulberry Silk"}
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] text-[#77716D] leading-tight">
                    {isAccessory ? "Hallmarked authenticity" : "Hand-loomed craftsmanship"}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-[#EAE5DF] px-1 sm:px-2">
                  <ShieldCheck className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    100% Certified
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] text-[#77716D] leading-tight">
                    Official atelier seal
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    Insured Transit
                  </span>
                  <span className="font-sans text-[8px] sm:text-[9px] text-[#77716D] leading-tight">
                    White-glove delivery
                  </span>
                </div>
              </div>

              {/* Collapsible Accordions */}
              <div className="space-y-2 pt-1">
                {/* Accordion 1: Material Specification */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "spec" ? null : "spec")}
                    className="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7B5644]" />
                      <span>{isAccessory ? "Craft & Material Specifications" : "Fabric & Artisan Specifications"}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "spec" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "spec" && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-[#77716D] space-y-2 border-t border-[#EAE5DF]/60">
                      <p><strong className="text-[#191919]">{isAccessory ? "Precious Metal / Base:" : "Primary Textile:"}</strong> {product.fabric}</p>
                      <p><strong className="text-[#191919]">{isAccessory ? "Gemstone & Enamel:" : "Embroidery Artistry:"}</strong> {product.embroidery}</p>
                      <ul className="list-disc pl-4 space-y-1 pt-1">
                        {product.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Care Guide */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                    className="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#7B5644]" />
                      <span>Preservation &amp; Care</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "care" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "care" && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-[#77716D] border-t border-[#EAE5DF]/60">
                      <p>{product.washCare}</p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Shipping & Returns */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                    className="w-full py-3.5 px-4 sm:px-5 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#7B5644]" />
                      <span>Shipping &amp; Returns</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "shipping" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "shipping" && (
                    <div className="px-4 sm:px-5 pb-4 pt-1 text-xs text-[#77716D] space-y-1.5 border-t border-[#EAE5DF]/60">
                      <p><strong className="text-[#191919]">Timeline:</strong> {product.deliveryTime}</p>
                      <p>Complimentary worldwide insured express delivery in signature archival packaging.</p>
                      <p>Custom couture and bespoke jewelry qualify for complimentary virtual styling and adjustment consultation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ════ RIGHT COLUMN: Product Information Dossier (Visible in One Desktop Viewport) ════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-18 flex flex-col justify-start">

            {/* 1. Category Label / Eyebrow */}
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1 lg:mb-1.5">
              {product.subCategory || product.categoryLabel}
            </span>

            {/* 2. Product Title */}
            <h1 className="font-serif text-2xl lg:text-[1.75rem] xl:text-3xl text-[#191919] font-normal leading-tight tracking-tight mb-1.5 lg:mb-2">
              {product.title}
            </h1>

            {/* 3. Rating & Review Count */}
            <div className="flex items-center gap-2 mb-2 lg:mb-2.5">
              <div className="flex items-center text-[#C29B38]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#C29B38] text-[#C29B38]"
                  />
                ))}
              </div>
              <span className="font-sans text-xs text-[#77716D]">
                4.9 <span className="text-[#C4C7C7] mx-1">•</span> 84 reviews
              </span>
            </div>

            {/* 4. Price Row */}
            <div className="flex items-baseline flex-wrap gap-2.5 pb-2.5 lg:pb-3 border-b border-[#EAE5DF] mb-3 lg:mb-3.5">
              <span className="font-serif text-xl lg:text-2xl font-normal text-[#191919] tracking-tight">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="font-sans text-xs text-[#77716D] line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
              <span className="font-sans text-[10px] text-[#77716D] uppercase tracking-widest ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            {/* 5. Short Description */}
            <p className="font-sans text-xs lg:text-[13px] text-[#77716D] leading-relaxed mb-3 lg:mb-3.5 line-clamp-3 lg:line-clamp-2 xl:line-clamp-3">
              {product.description}
            </p>

            {/* 6. Product Options (Clothing Size Selector vs Accessories Streamlined View) */}
            {!isAccessory ? (
              /* Clothing Size Selector */
              <div className="mb-3 lg:mb-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold">
                    Select Size: <span className="text-[#7B5644] font-medium">{selectedSize}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="font-sans text-[10px] uppercase tracking-wider text-[#7B5644] hover:text-[#191919] transition-colors underline underline-offset-4"
                  >
                    Atelier Fit Guide
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(availableSizes.length > 0 ? availableSizes : ["XS", "S", "M", "L", "XL"]).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 lg:w-10 lg:h-10 flex items-center justify-center font-sans text-xs uppercase font-semibold transition-all ${
                        selectedSize === size
                          ? "bg-[#191919] text-[#FDFBF8] shadow-xs"
                          : "bg-[#F5F3F0] text-[#191919] hover:bg-[#EAE8E5] border border-transparent hover:border-[#191919]/20"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Accessories: No Clothing Sizes */
              <div className="mb-3 lg:mb-3.5 py-2 px-3 bg-[#F5F3F0] border border-[#EAE5DF]">
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#7B5644] font-semibold block mb-0.5">
                  Fitting &amp; Sizing
                </span>
                <p className="font-sans text-xs text-[#191919]">
                  {product.category === "rings"
                    ? "Adjustable Atelier Band (Comfort-fit Free Size)"
                    : product.category === "bracelets"
                    ? "Standard Atelier Wrist Fit (2.4 - 2.6 cuff)"
                    : "Standard Atelier Dimensions (One Size)"}
                </p>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="mb-3 lg:mb-3.5 flex items-center space-x-3">
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold">
                Qty:
              </span>
              <div className="flex items-center border border-[#EAE5DF] bg-[#F5F3F0]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-xs hover:text-[#7B5644] transition-colors text-[#191919]"
                >
                  -
                </button>
                <span className="px-2.5 text-xs font-semibold text-[#191919]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-xs hover:text-[#7B5644] transition-colors text-[#191919]"
                >
                  +
                </button>
              </div>
            </div>

            {/* 7. Dual Action Buttons: ADD TO CART + BUY NOW */}
            <div className="grid grid-cols-2 gap-2.5 lg:gap-3 mb-1">
              <button
                onClick={handleAddToCart}
                className="h-11 lg:h-12 bg-[#F5F3F0] hover:bg-[#EAE8E5] border border-[#EAE5DF] text-[#191919] font-sans text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {addedToast ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="h-11 lg:h-12 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] font-sans text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center justify-center shadow-xs"
              >
                Buy Now
              </button>
            </div>

            {/* ════ MOBILE-ONLY FLOW: Badges & Accordions placed right below buttons ════ */}
            <div className="lg:hidden flex flex-col gap-4 mt-6">
              {/* Mobile Assurance Badges */}
              <div className="grid grid-cols-3 gap-2 py-4 px-3 bg-[#F5F3F0] border border-[#EAE5DF]">
                <div className="flex flex-col items-center text-center">
                  <Sparkles className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    {isAccessory ? "22K Gold & Polki" : "Pure Mulberry Silk"}
                  </span>
                  <span className="font-sans text-[8px] text-[#77716D] leading-tight">
                    {isAccessory ? "Hallmarked authenticity" : "Hand-loomed craftsmanship"}
                  </span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-[#EAE5DF] px-1">
                  <ShieldCheck className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    100% Certified
                  </span>
                  <span className="font-sans text-[8px] text-[#77716D] leading-tight">
                    Official atelier seal
                  </span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-5 h-5 text-[#7B5644] mb-1" />
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#191919] font-semibold mb-0.5">
                    Insured Transit
                  </span>
                  <span className="font-sans text-[8px] text-[#77716D] leading-tight">
                    White-glove delivery
                  </span>
                </div>
              </div>

              {/* Mobile Accordions */}
              <div className="space-y-2">
                {/* Accordion 1: Material Specification */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "spec" ? null : "spec")}
                    className="w-full py-3.5 px-4 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7B5644]" />
                      <span>{isAccessory ? "Craft & Material Specifications" : "Fabric & Artisan Specifications"}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "spec" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "spec" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#77716D] space-y-2 border-t border-[#EAE5DF]/60">
                      <p><strong className="text-[#191919]">{isAccessory ? "Precious Metal / Base:" : "Primary Textile:"}</strong> {product.fabric}</p>
                      <p><strong className="text-[#191919]">{isAccessory ? "Gemstone & Enamel:" : "Embroidery Artistry:"}</strong> {product.embroidery}</p>
                      <ul className="list-disc pl-4 space-y-1 pt-1">
                        {product.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Care Guide */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                    className="w-full py-3.5 px-4 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#7B5644]" />
                      <span>Preservation &amp; Care</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "care" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "care" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#77716D] border-t border-[#EAE5DF]/60">
                      <p>{product.washCare}</p>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Shipping & Returns */}
                <div className="bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                    className="w-full py-3.5 px-4 flex items-center justify-between text-left text-xs uppercase tracking-[0.16em] font-semibold text-[#191919]"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#7B5644]" />
                      <span>Shipping &amp; Returns</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#77716D] transition-transform duration-300 ${
                        openAccordion === "shipping" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordion === "shipping" && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[#77716D] space-y-1.5 border-t border-[#EAE5DF]/60">
                      <p><strong className="text-[#191919]">Timeline:</strong> {product.deliveryTime}</p>
                      <p>Complimentary worldwide insured express delivery in signature archival packaging.</p>
                      <p>Custom couture and bespoke jewelry qualify for complimentary virtual styling and adjustment consultation.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Products / Curated Pairings (4 Columns on Desktop, 2 on Mobile) ── */}
      <section className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16 bg-[#F5F3F0] border-t border-[#EAE5DF]">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-6 sm:mb-8 flex items-end justify-between">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] block mb-1 font-semibold">
                CURATED PAIRINGS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal">
                Complete The Atelier Look
              </h2>
            </div>
            <Link
              href={isAccessory ? "/accessories" : "/categories"}
              className="text-xs uppercase tracking-wider text-[#7B5644] hover:text-[#191919] font-semibold hidden sm:inline-block transition-colors"
            >
              View All Collection &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Atelier Fit Guide Modal ── */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-1 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
              ATELIER FIT GUIDE
            </span>
            <h3 className="font-serif text-2xl text-[#191919] font-normal mb-4">
              Standard Size Chart (Inches)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE5DF] text-[#191919] uppercase tracking-wider font-semibold">
                  <th className="py-2.5">Size</th>
                  <th className="py-2.5">Bust</th>
                  <th className="py-2.5">Waist</th>
                  <th className="py-2.5">Hip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF] text-[#77716D]">
                <tr>
                  <td className="py-2.5 font-semibold text-[#191919]">XS</td>
                  <td className="py-2.5">32&quot;</td>
                  <td className="py-2.5">26&quot;</td>
                  <td className="py-2.5">36&quot;</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-[#191919]">S</td>
                  <td className="py-2.5">34&quot;</td>
                  <td className="py-2.5">28&quot;</td>
                  <td className="py-2.5">38&quot;</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-[#191919]">M</td>
                  <td className="py-2.5">36&quot;</td>
                  <td className="py-2.5">30&quot;</td>
                  <td className="py-2.5">40&quot;</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-[#191919]">L</td>
                  <td className="py-2.5">38&quot;</td>
                  <td className="py-2.5">32&quot;</td>
                  <td className="py-2.5">42&quot;</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-semibold text-[#191919]">XL</td>
                  <td className="py-2.5">40&quot;</td>
                  <td className="py-2.5">34&quot;</td>
                  <td className="py-2.5">44&quot;</td>
                </tr>
              </tbody>
            </table>
            <p className="text-[11px] text-[#77716D] mt-5 leading-relaxed">
              Complimentary custom tailoring and virtual styling consultations are available for all orders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
