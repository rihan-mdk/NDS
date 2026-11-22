import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Heart,
  ShoppingBag
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | NEEL'S DESIGNER STUDIO",
  description:
    "Welcome to Neel's Designer Studio — Fashion That Reflects Your Style. Discover our collections in Korean fashion, Pakistani wear, lehengas, gowns, kurtis, and accessories.",
};

export default function AboutPage() {
  const collectionCategories = [
    { title: "Korean Fashion", href: "/categories" },
    { title: "Short Kurtis", href: "/collections/short-kurti" },
    { title: "Pakistani Wear", href: "/categories" },
    { title: "Lehengas", href: "/collections/lehenga" },
    { title: "Gowns", href: "/collections/gown" },
    { title: "Party Wear", href: "/categories" },
    { title: "Co-ord Sets", href: "/categories" },
    { title: "Jeans", href: "/categories" },
    { title: "Fashion Accessories", href: "/accessories" },
  ];

  const approaches = [
    {
      title: "Style",
      subtitle: "Occasion-Ready Aesthetics",
      description: "Bringing together fashionable selections for different occasions.",
    },
    {
      title: "Customer Experience",
      subtitle: "Seamless Journey",
      description: "Making product discovery and ordering simple and convenient.",
    },
    {
      title: "Trust",
      subtitle: "Transparency & Care",
      description: "Providing clear product information, transparent policies, and responsive customer support.",
    },
    {
      title: "Convenience",
      subtitle: "Always Within Reach",
      description: "Making our collections accessible through our website and official communication channels.",
    },
  ];

  return (
    <div className="w-full bg-[#FDFBF8] text-[#191919]">
      {/* SECTION 1: Editorial Hero Header */}
      <section className="relative w-full overflow-hidden bg-[#191919] min-h-[50vh] sm:min-h-[60vh] flex items-end">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-full h-full object-cover object-center brightness-[0.70]"
            alt="Neel's Designer Studio Atelier"
            src="/images/about-banner.png"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-[#191919] via-[#191919]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-16 pt-28">
          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B58A76] font-semibold block mb-3">
              ABOUT NEEL&apos;S DESIGNER STUDIO
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FDFBF8] font-normal leading-tight mb-4">
              Fashion That Reflects Your Style
            </h1>
            <p className="font-sans text-sm sm:text-base text-[#F5F3F0]/90 max-w-2xl leading-relaxed">
              Welcome to Neel&apos;s Designer Studio, a fashion destination created for individuals who appreciate style, elegance, and thoughtful design.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Welcome Narrative */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-3">
              OUR PHILOSOPHY
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#191919] mb-6 font-normal leading-snug">
              Fashion is more than just clothing — it is a way to express individuality.
            </h2>
            <div className="space-y-4 font-sans text-sm text-[#77716D] leading-relaxed">
              <p>
                We believe fashion is more than just clothing. It is a way to express individuality, confidence, and personality.
              </p>
              <p>
                Our collection brings together carefully selected styles across different fashion categories, offering customers a convenient way to discover outfits and accessories that complement their personal style.
              </p>
            </div>
          </div>

          <div className="relative w-full overflow-hidden border border-[#EAE5DF] bg-[#EFEEEB] shadow-md" style={{ paddingTop: "110%" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/about_us.png"
              alt="Neel's Designer Studio Collection"
              className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Our Collection */}
      <section className="w-full bg-[#F5F3F0] border-y border-[#EAE5DF] py-16 sm:py-20 px-6 sm:px-10 lg:px-14">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
              CURATED STYLES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#191919]">
              Our Collection
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#77716D] max-w-xl mx-auto mt-2">
              Explore a carefully chosen range of styles for every celebration, casual outing, and standout moment.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {collectionCategories.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group p-5 sm:p-6 bg-[#FDFBF8] border border-[#EAE5DF] hover:border-[#7B5644] transition-all hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#B58A76] font-semibold block mb-2">
                    CATEGORY {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg text-[#191919] group-hover:text-[#7B5644] transition-colors">
                    {item.title}
                  </h3>
                </div>
                <div className="mt-4 flex items-center text-[10px] uppercase tracking-wider text-[#77716D] group-hover:text-[#191919] transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Accessories Detail Highlight */}
          <div className="mt-8 p-6 bg-[#FDFBF8] border border-[#EAE5DF] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
                ACCESSORIES SPOTLIGHT
              </span>
              <p className="font-sans text-xs sm:text-sm text-[#191919]">
                Our accessories collection includes bracelets, clutches, and rings.
              </p>
            </div>
            <Link
              href="/accessories"
              className="inline-flex items-center text-xs uppercase tracking-[0.18em] font-medium text-[#191919] hover:text-[#7B5644] transition-colors whitespace-nowrap"
            >
              <span>View Accessories</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Our Approach */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            HOW WE WORK
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#191919]">
            Our Approach
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] max-w-xl mx-auto mt-2">
            At Neel&apos;s Designer Studio, we focus on:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {approaches.map((approach, idx) => (
            <div key={idx} className="p-6 bg-[#FDFBF8] border border-[#EAE5DF] flex flex-col justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#B58A76] font-semibold block mb-2">
                  {approach.subtitle}
                </span>
                <h3 className="font-serif text-xl text-[#191919] mb-3">{approach.title}</h3>
                <p className="font-sans text-xs text-[#77716D] leading-relaxed">
                  {approach.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Our Commitment */}
      <section className="w-full bg-[#F5F3F0] border-y border-[#EAE5DF] py-16 px-6 sm:px-10 lg:px-14">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            SERVICE PROMISE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#191919] mb-4">
            Our Commitment
          </h2>
          <div className="space-y-3 font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed max-w-2xl mx-auto">
            <p>
              We aim to make every shopping experience comfortable and reliable, from discovering a product to receiving an order.
            </p>
            <p>
              Our customer support team is available to assist with order enquiries, delivery updates, and eligible product-related concerns.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Get in Touch & Atelier Contact */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-16 sm:py-24 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            COMMUNICATION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#191919] mb-2">
            Get in Touch
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#77716D]">
            We would love to hear from you.
          </p>
        </div>

        <div className="bg-[#FDFBF8] border border-[#EAE5DF] p-8 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-[#EAE5DF] pb-6">
            <h3 className="font-serif text-2xl text-[#191919] mb-1">
              Neel&apos;s Designer Studio
            </h3>
            <p className="font-sans text-xs text-[#7B5644] font-medium uppercase tracking-wider">
              Owner: Nilofer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs sm:text-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block mb-1">
                Email
              </span>
              <a
                href="mailto:neels9589@gmail.com"
                className="text-[#191919] hover:text-[#7B5644] underline font-medium"
              >
                neels9589@gmail.com
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block mb-1">
                WhatsApp / Primary Contact
              </span>
              <a
                href="https://wa.me/918123200215"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#191919] hover:text-[#7B5644] underline font-medium"
              >
                +91 8123200215
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block mb-1">
                Secondary Contact
              </span>
              <a
                href="tel:+919740259215"
                className="text-[#191919] hover:text-[#7B5644] underline font-medium"
              >
                +91 9740259215
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block mb-1">
                Customer Support Hours
              </span>
              <p className="text-[#191919] font-medium">Daily, 9:00 AM – 8:00 PM</p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block mb-1">
                Location
              </span>
              <p className="text-[#191919]">Moodbidri, Karnataka – 574227, India</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE5DF] flex flex-wrap gap-4 items-center justify-between text-xs text-[#77716D]">
            <span>Connect with us through our official website, WhatsApp, and Instagram.</span>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#191919] hover:text-[#7B5644] underline"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/918123200215"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#191919] hover:text-[#7B5644] underline"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Studio Tagline */}
        <div className="text-center mt-12">
          <p className="font-serif italic text-lg sm:text-xl text-[#7B5644]">
            Neel&apos;s Designer Studio — Discover your style. Express yourself.
          </p>
        </div>
      </section>
    </div>
  );
}
