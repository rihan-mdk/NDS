"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryDiscoveryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  alt: string;
}

const CATEGORIES: CategoryDiscoveryItem[] = [
  {
    id: "korean",
    name: "KOREAN",
    slug: "korean",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCs_Gk-skZmje9I1LA2f8zF6jADX9iGDImEuiVJwQ2IWnUok1lXO91QA2bnOx84rPoG4FElPAAm4t8_neikL9V0BCdd-FFKAnkox4dKehGDq-upI1jJLjiGavUjUuOAT56AfflSrAdxEsbFJXBiG_QULGC1A99kUUkhqHOxXft0LUfQLOw_pvcjqhRMxqQolC2fRgir7mnIa0Zn7ymNgfLUtsNn-8IysngfaN39RSaL",
    alt: "Korean Minimalist Contemporary Tailoring",
  },
  {
    id: "short-kurti",
    name: "SHORT KURTI",
    slug: "short-kurti",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDa7YtcMTAGCoRTMGeM2MQ4PPSUE3nY0ndT95g079HbkTfqGHcvSmi2i5uosF3JpeEts49lsQtMrSjOn5DAwxYy_PCocNB9ztqPFEzu18u7ENCJR4nJ2Vr-ZcwGUPmOZlDbsNyVHMrOm7tIHBrS4gi0yg7PSuIg6enaBTquUSZ4lzLI6Kae9YyaZcuXI15higHIEI1hrCpamHkqfR6lIDaJNopFMnY5lO6Z4GGzX-qA",
    alt: "Artisanal Handloom Short Kurti with Contemporary Needlework",
  },
  {
    id: "pakistani",
    name: "PAKISTANI",
    slug: "pakistani",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdgqTEm_9UhQYsscfcIk5TC3NnKJykm_Ts_dURhq_mGOLyICtEqNPHQxJAi1m1a5LKUydjuTLP1JSnz8p6ch7yH7L9si-nUYedb889I-t14RHG7HAchdaSXgg6LTBGzjH3c7Gqajy4oLeQKJTOQK0PLXpDPBFKDEJ593uwCeU2cNf0V0ThIBd4uq3VsDWkU34dOy6IXQPUxKZCa3cnYN3K0jtitWqnAyWzbx3SGynJ",
    alt: "Flowing Luxury Pakistani Lawn & Raw Silk Ensemble",
  },
  {
    id: "lehenga",
    name: "LEHENGA",
    slug: "lehenga",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDZB1C1b4wIsUj3r9TJv0bP2nAQsOIjfm9ExraVyeejU1laqBIbigB_0OeP0raLA2BbbBkfuGpsYIArl6b0t6_V14eSXlW0uq7iGZGFoo04S69k_Bwu_zJIB1nLrnXSi-hdHF__CsnKvIDEjwxJfY0S-0DYemri-iq3cj1Xe2rlLN3RalnNcy89Rk_oLIhptPJW5nMO-jCcyVfBsREBz8bImhLH6s_ow1u9uuAoT0V",
    alt: "High Couture Handcrafted Bridal & Festive Lehenga",
  },
  {
    id: "gown",
    name: "GOWN",
    slug: "gown",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCM05KT-wr6KIy61aaOgK_a90RWm1eazWi0XDmU5tZSfAtwABYYv92--MI0krKPApZNgT2ydHKBr9RCxMgOj8EneI9k8EGbTtCmChCGhLwpngkv_Og2E-3tKMBCQvEg77LO2nV-eWGEmD45q9BhjlvWE_MzRR78aShCNdkeP2aOx8Dp619o4QPKmQGdRyUuTzT_umhv3_8yFbZieBmuvl_-WYU-CnwrrZg-0ZNvWxUS",
    alt: "Sculptural Architectural Evening Gown",
  },
  {
    id: "party-wear",
    name: "PARTY WEAR",
    slug: "party-wear",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAdT-xNFUh3RpOCVGpofbw1KlVAhvmNDnh2HC7GmuCaOFKOVydhmwa3apm9UBEdCdQVlzjxyUfp8Q5u27cDyl0wCKPNjg_krM_DX4pLF90B_ANu6-GBlP96cIdWTgzzJ3o2Mw2_JQJBXEjOoGkXdFl5P1e4C-l6tasRoIbdflvwubcJC2TZHVZW3SSD0xcJl_KkL6E2H12E8mzXYWB461qxciLPuRz1Tt_jsKVZZvp4",
    alt: "Statement Evening Party Wear Couture",
  },
  {
    id: "co-ord-set",
    name: "CO-ORD SET",
    slug: "co-ord-set",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuCbc88grQ4WV9P3FZO9jCY7gApELjwc9GndpjzkAC0DrwZBuI-25wyYP_fNe_WLOZv0ufYmTTISRM520z-MyQ6YP9BIw7p6I-JXUSy_tKqbaEo7C_3LH5FPJ7PV50avI8gfc5gs5O_ce4o5IFJc2k5ZDFP3E1Np2Xxk0YEZquobWwlQBDgc01gRSQSIMPAPFbDLpckhuOXuRA5L7w3bCLeVg-EWbYRPHdzKFBNVUc",
    alt: "Modern Raw Silk Coordinated Atelier Set",
  },
  {
    id: "jeans",
    name: "JEANS",
    slug: "jeans",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuABqG1V_7BzODuslTpgTHl6ju_8nWtiLu9RQgrb7uESTr0quwlr2lGdVWg5lTla0zXtyO5xqr3Pd7LNB5IqJy_9hErkdycWrEsbSVgnAdIILYYY7uOBXuTe0de8J6yQCychEztGm_Z2Gr14wfwZuOVgNs32lr5BSs_sAtNhNCv3gAKN5J3l_BNohzHB5U5sbY7GDWlwsJ5FxAziMJ_j1LHHDbBAssbJOGDzHc-Edllg",
    alt: "Artisan Handcrafted Tailored Selvedge Denim",
  },
];

export default function CategoriesPage() {
  return (
    <div className="w-full bg-[#FDFBF8] min-h-[calc(100vh-3.5rem)]">
      {/* Editorial Page Header */}
      <section className="w-full px-4 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-5 sm:pb-8 border-b border-[#EAE5DF]">
        <div className="max-w-3xl">
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1.5 sm:mb-2">
            DISCOVER THE COLLECTION
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl tracking-tight text-[#191919] font-normal mb-2 sm:mb-3">
            Our Collections
          </h1>
          <p className="font-sans text-xs sm:text-base text-[#77716D] leading-relaxed">
            Explore thoughtfully curated styles designed for every occasion.
          </p>
        </div>
      </section>

      {/* 8 Category Visual Cards Grid — 2-Column on Mobile, 4-Column on Desktop, 4:5 Aspect Ratio */}
      <section className="w-full px-4 sm:px-10 lg:px-14 py-6 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col bg-transparent overflow-hidden"
            >
              {/* 4:5 Portrait Category Image */}
              <div className="relative aspect-[4/5] w-full bg-[#F5F3F0] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.alt}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Minimal Category Title with Subtle Arrow */}
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
