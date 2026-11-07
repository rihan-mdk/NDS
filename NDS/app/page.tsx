"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRODUCTS, getProductsByCategory, Product } from "@/lib/products-data";
import { useLiveProducts } from "@/lib/products-store";
import { ProductCard } from "@/components/ProductCard";
import { QuickViewModal } from "@/components/QuickViewModal";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import ThreeDParallaxGallery from "@/components/ui/3d-parallax-unfurling-gallery";
import { motion } from "framer-motion";

const GALLERY_IMAGES = [
  { src: "/images/gallery/gallery-01.jpeg", alt: "Neel's Designer Studio — Atelier Creation 1" },
  { src: "/images/gallery/gallery-02.jpeg", alt: "Neel's Designer Studio — Atelier Creation 2" },
  { src: "/images/gallery/gallery-03.jpeg", alt: "Neel's Designer Studio — Atelier Creation 3" },
  { src: "/images/gallery/gallery-04.jpeg", alt: "Neel's Designer Studio — Atelier Creation 4" },
  { src: "/images/gallery/gallery-05.jpeg", alt: "Neel's Designer Studio — Atelier Creation 5" },
  { src: "/images/gallery/gallery-06.jpeg", alt: "Neel's Designer Studio — Atelier Creation 6" },
  { src: "/images/gallery/gallery-07.jpeg", alt: "Neel's Designer Studio — Atelier Creation 7" },
  { src: "/images/gallery/gallery-08.jpeg", alt: "Neel's Designer Studio — Atelier Creation 8" },
  { src: "/images/gallery/gallery-09.jpeg", alt: "Neel's Designer Studio — Atelier Creation 9" },
  { src: "/images/gallery/gallery-10.jpeg", alt: "Neel's Designer Studio — Atelier Creation 10" },
  { src: "/images/gallery/gallery-11.jpeg", alt: "Neel's Designer Studio — Atelier Creation 11" },
  { src: "/images/gallery/gallery-12.jpeg", alt: "Neel's Designer Studio — Atelier Creation 12" },
  { src: "/images/gallery/gallery-13.jpeg", alt: "Neel's Designer Studio — Atelier Creation 13" },
  { src: "/images/gallery/gallery-14.jpeg", alt: "Neel's Designer Studio — Atelier Creation 14" },
  { src: "/images/gallery/gallery-15.jpeg", alt: "Neel's Designer Studio — Atelier Creation 15" },
  { src: "/images/gallery/gallery-16.jpeg", alt: "Neel's Designer Studio — Atelier Creation 16" },
];

const CURATED_CATEGORIES = [
  {
    name: "Lehengas",
    href: "/collections/lehenga",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDZB1C1b4wIsUj3r9TJv0bP2nAQsOIjfm9ExraVyeejU1laqBIbigB_0OeP0raLA2BbbBkfuGpsYIArl6b0t6_V14eSXlW0uq7iGZGFoo04S69k_Bwu_zJIB1nLrnXSi-hdHF__CsnKvIDEjwxJfY0S-0DYemri-iq3cj1Xe2rlLN3RalnNcy89Rk_oLIhptPJW5nMO-jCcyVfBsREBz8bImhLH6s_ow1u9uuAoT0V",
  },
  {
    name: "Gowns & Evening Wear",
    href: "/collections/gown",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCM05KT-wr6KIy61aaOgK_a90RWm1eazWi0XDmU5tZSfAtwABYYv92--MI0krKPApZNgT2ydHKBr9RCxMgOj8EneI9k8EGbTtCmChCGhLwpngkv_Og2E-3tKMBCQvEg77LO2nV-eWGEmD45q9BhjlvWE_MzRR78aShCNdkeP2aOx8Dp619o4QPKmQGdRyUuTzT_umhv3_8yFbZieBmuvl_-WYU-CnwrrZg-0ZNvWxUS",
  },
  {
    name: "Short Kurtis & Separates",
    href: "/collections/short-kurti",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa7YtcMTAGCoRTMGeM2MQ4PPSUE3nY0ndT95g079HbkTfqGHcvSmi2i5uosF3JpeEts49lsQtMrSjOn5DAwxYy_PCocNB9ztqPFEzu18u7ENCJR4nJ2Vr-ZcwGUPmOZlDbsNyVHMrOm7tIHBrS4gi0yg7PSuIg6enaBTquUSZ4lzLI6Kae9YyaZcuXI15higHIEI1hrCpamHkqfR6lIDaJNopFMnY5lO6Z4GGzX-qA",
  },
  {
    name: "Pakistani Suits",
    href: "/collections/pakistani",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdgqTEm_9UhQYsscfcIk5TC3NnKJykm_Ts_dURhq_mGOLyICtEqNPHQxJAi1m1a5LKUydjuTLP1JSnz8p6ch7yH7L9si-nUYedb889I-t14RHG7HAchdaSXgg6LTBGzjH3c7Gqajy4oLeQKJTOQK0PLXpDPBFKDEJ593uwCeU2cNf0V0ThIBd4uq3VsDWkU34dOy6IXQPUxKZCa3cnYN3K0jtitWqnAyWzbx3SGynJ",
  },
  {
    name: "Accessories",
    href: "/accessories",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAzcVOWYJb1gD6fk7UwqLMJCcFi5ffOrtlxPtknpZ5fplAAmUoNHnn8sl2eAiXRqMn_G_iMSZwzLKY6WzsLEK6muv-QLfwJmBZHcZjFs6tifDN9hax5AY6tEGGsX5Ngyw8UlonXjw6_b5v2waq7efXSNv6f0n4E9nKCyWXbD5FOw_cXetIaLGTF6DUf3qoxIEdgh_7Sz7WMMqxwxpU40w1ftRlOyhul0mo0AVsGoTB",
  },
];

export default function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const allLiveProducts = useLiveProducts();
  const newArrivals = allLiveProducts.filter((p) => p.newArrival).slice(0, 4);

  // Hero animation variants — typed as const so framer-motion's Easing type is satisfied
  const heroTextContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.13 as number, delayChildren: 0.55 as number } },
  };
  const heroItem = (yOffset: number, dur: number) =>
    ({
      hidden: { y: yOffset, opacity: 0 },
      visible: { y: 0, opacity: 1, transition: { duration: dur, ease: [0.25, 0, 0, 1] as [number, number, number, number] } },
    }) as const;

  return (
    <div className="flex flex-col w-full bg-[#FDFBF8]">
      {/* SECTION 1: Editorial Hero — Static sticky layer for page overlap effect */}
      {/* To swap the hero image: replace /images/hero.jpg with your new image path in public/images/ */}
      <section className="sticky top-14 sm:top-0 z-0 w-full h-[calc(100dvh-146px)] sm:h-screen sm:-mt-14 overflow-hidden bg-[#1A1712] flex items-end sm:items-center">

        {/* Mobile hero image — custom high-res portrait editorial */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/images/hero-mobile.jpg"
          alt="NEEL'S DESIGNER STUDIO — Luxury Fashion Editorial"
          className="absolute inset-0 w-full h-full object-cover object-top sm:hidden pointer-events-none select-none"
          style={{
            transform: "translate3d(0, 0, 0)",
            WebkitTransform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Desktop hero image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/images/hero.jpg"
          alt="NEEL'S DESIGNER STUDIO — Luxury Fashion Editorial"
          className="absolute inset-0 w-full h-full object-cover object-top hidden sm:block will-change-transform transform-gpu"
          style={{ transform: "translate3d(0, 0, 0)" }}
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Mobile overlay: soft bottom-up gradient keeping the model and outfit visible */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(15,12,10,0.85) 0%, rgba(15,12,10,0.42) 48%, rgba(15,12,10,0.06) 78%, transparent 100%)",
          }}
        />
        {/* Desktop overlay: left-to-right gradient */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              "linear-gradient(to right, rgba(15,12,10,0.72) 0%, rgba(15,12,10,0.48) 40%, rgba(15,12,10,0.12) 70%, transparent 100%)",
          }}
        />
        {/* Desktop bottom vignette */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none hidden sm:block"
          style={{
            background: "linear-gradient(to top, rgba(15,12,10,0.45) 0%, transparent 100%)",
          }}
        />

        {/* Hero text overlay — staggered fade-up entrance */}
        <motion.div
          className="relative z-10 w-full px-5 sm:px-12 lg:px-20 pb-4 sm:pb-12 pt-0 sm:pt-16 flex flex-col items-start"
          initial="hidden"
          animate="visible"
          variants={heroTextContainer}
        >
          <div className="max-w-[280px] sm:max-w-xl">
            {/* Eyebrow */}
            <motion.span
              className="block font-sans text-[8px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#C9A96E] mb-1 sm:mb-4 font-semibold"
              variants={heroItem(18, 0.55)}
            >
              NEEL&apos;S DESIGNER STUDIO
            </motion.span>
            {/* Heading */}
            <motion.h1
              className="font-serif text-[1.45rem] sm:text-5xl lg:text-6xl text-[#FDFBF8] tracking-tight leading-[1.1] mb-1.5 sm:mb-5 font-normal"
              variants={heroItem(22, 0.6)}
            >
              Where every outfit<br />feels extraordinary.
            </motion.h1>
            {/* Subtext */}
            <motion.p
              className="font-sans text-[11px] sm:text-[15px] text-[#D6D0C8] max-w-[230px] sm:max-w-md mb-3 sm:mb-8 leading-snug font-light"
              variants={heroItem(16, 0.5)}
            >
              Discover fashion beyond the ordinary.
            </motion.p>
            {/* CTA */}
            <motion.div variants={heroItem(16, 0.5)}>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center bg-[#FDFBF8] text-[#191919] text-[9px] sm:text-[11px] font-semibold px-5 py-2.5 sm:px-9 sm:py-3.5 uppercase tracking-[0.2em] sm:tracking-[0.22em] hover:bg-[#C9A96E] hover:text-[#FDFBF8] transition-colors duration-300 shadow-md"
              >
                EXPLORE COLLECTION
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* OVERLAPPING CONTENT — Smoothly slides up over the static hero with square edges */}
      <div className="relative z-10 bg-[#FDFBF8] shadow-[0_-12px_32px_rgba(0,0,0,0.18)] border-t border-[#EAE5DF]/70">
        {/* SECTION 2: New Arrivals (4-Column Grid) */}
        <section className="w-full px-4 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-20 bg-[#FDFBF8]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 border-b border-[#EAE5DF] pb-4 sm:pb-5">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] block mb-1.5 font-semibold">
              LATEST DROPS · AUTUMN/WINTER 2025
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#191919] font-normal">
              New Arrivals
            </h2>
          </div>
          <Link
            href="/categories"
            className="mt-3 sm:mt-0 inline-flex items-center text-xs uppercase tracking-[0.18em] font-semibold text-[#191919] hover:text-[#7B5644] transition-colors"
          >
            <span>VIEW ALL NEW PIECES</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Mobile: 2 columns · Desktop: 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: Our Gallery — 3D Parallax Unfurling Gallery */}
      <ThreeDParallaxGallery
        images={GALLERY_IMAGES.map((img) => img.src)}
        headerTitle="Our Gallery"
        headerSubtitle="THE ATELIER JOURNAL"
      />

      {/* SECTION 4: Category / Collection Discovery */}
      <section className="w-full px-4 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-20 bg-[#FDFBF8]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 border-b border-[#EAE5DF] pb-4 sm:pb-5">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] block mb-1.5 font-semibold">
              SIGNATURE EDITIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#191919] font-normal">
              Explore Collections
            </h2>
          </div>
          <Link
            href="/categories"
            className="mt-4 md:mt-0 inline-flex items-center text-xs uppercase tracking-[0.18em] font-semibold text-[#191919] hover:text-[#7B5644] transition-colors"
          >
            <span>ALL CATEGORIES</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Visual Category Cards (5 columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {CURATED_CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative flex flex-col bg-transparent overflow-hidden"
            >
              <div className="relative aspect-[3/4] w-full bg-[#F5F3F0] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#FDFBF8] text-[#191919] flex items-center justify-center shadow-md">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="pt-3 pb-1 flex items-center justify-between">
                <h3 className="font-serif text-sm text-[#191919] group-hover:text-[#7B5644] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-[#77716D] opacity-0 group-hover:opacity-100 transition-opacity">
                  VIEW
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
