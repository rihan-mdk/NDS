"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLiveCategories } from "@/lib/categories-store";

export default function AccessoriesPage() {
  const { accessories: categories } = useLiveCategories();

  return (
    <div className="w-full bg-[#FDFBF8] min-h-[calc(100vh-3.5rem)]">
      {/* Editorial Page Header */}
      <section className="w-full px-4 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-5 sm:pb-8 border-b border-[#EAE5DF]">
        <div className="max-w-3xl">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1.5 sm:mb-2">
            HAUTE JOAILLERIE &amp; ACCENTS
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl tracking-tight text-[#191919] font-normal mb-2 sm:mb-3">
            Jewels &amp; Accents
          </h1>
          <p className="font-sans text-xs sm:text-base text-[#77716D] leading-relaxed">
            Explore handcrafted bracelets, evening clutches, and statement rings designed to complement imperial couture.
          </p>
        </div>
      </section>

      {/* Accessory Category Visual Cards Grid — 2-Column on Mobile (2x2 structure), 3-Column on Desktop, 4:5 Aspect Ratio */}
      <section className="w-full px-4 sm:px-10 lg:px-14 py-6 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/accessories/${category.slug}`}
              className="group flex flex-col bg-transparent overflow-hidden"
            >
              {/* 4:5 Portrait Category Image */}
              <div className="relative aspect-[4/5] w-full bg-[#F5F3F0] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.alt || category.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Minimal Category Title with Subtle Arrow — Name only, no price/meta */}
              <div className="pt-2.5 sm:pt-4 pb-1 sm:pb-2 flex items-center justify-between">
                <span className="font-serif text-[12px] sm:text-base tracking-[0.14em] text-[#191919] uppercase group-hover:text-[#7B5644] transition-colors font-medium truncate">
                  {category.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#191919] group-hover:text-[#7B5644] transform group-hover:translate-x-1.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
