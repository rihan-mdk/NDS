import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full bg-[#FDFBF8] text-[#191919]">
      {/* SECTION 1: Heritage Editorial Hero */}
      <section className="relative w-full overflow-hidden bg-[#191919] min-h-[56vw] sm:min-h-[70vh] flex items-end">
        <div className="absolute inset-0">
          <Image
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.72]"
            alt="NEEL'S DESIGNER STUDIO Atelier Heritage"
            src="/images/about-banner.png"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#191919] via-[#191919]/60 to-transparent pointer-events-none" />

        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-14 pb-16 pt-32">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#2C2825] font-semibold block mb-3">
            ESTABLISHED · ATELIER HERITAGE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#FDFBF8] font-normal leading-tight mb-4 max-w-3xl">
            About Neel&apos;s<br />Designer Studio
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#F5F3F0]/80 max-w-xl leading-relaxed">
            Where centuries of Hindustani textile mastery meets the refined sensibility of modern luxury couture.
          </p>
        </div>
      </section>

      {/* SECTION 2: Atelier Story / Narrative */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-3">
              OUR FOUNDING STORY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#191919] mb-6 font-normal leading-snug">
              Born from a love of<br />Indian heritage craftsmanship
            </h2>
            <div className="space-y-5 font-sans text-sm text-[#77716D] leading-relaxed">
              <p>
                Neel&apos;s Designer Studio was founded with a singular vision: to honour the forgotten art of India&apos;s ancestral textile ateliers, while presenting these masterpieces in a contemporary language that speaks to the discerning modern woman.
              </p>
              <p>
                Each piece in our collection passes through the hands of expert karigars — third-generation weavers from Varanasi, embroiderers from Lucknow, and meenakari artisans from Jaipur — before arriving at its final form.
              </p>
              <p>
                We believe in slow, purposeful fashion. Every stitch is intentional. Every thread is chosen with reverence. Every silhouette is designed to transcend trends and become an heirloom.
              </p>
            </div>
          </div>
          <div className="relative w-full aspect-[4/5] bg-[#EFEEEB] border border-[#EAE5DF] overflow-hidden shadow-lg">
            <Image
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
              alt="Atelier Bridal Heritage — Neel's Designer Studio"
              src="/images/about_us.png"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: The Atelier Pillars */}
      <section className="w-full bg-[#F5F3F0] border-y border-[#EAE5DF] py-20 px-6 sm:px-10 lg:px-14">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
              PHILOSOPHY
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#191919]">
              The Neel&apos;s Atelier Pillars
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Pure Heritage Karigari",
                description:
                  "We exclusively source from certified master weavers across Varanasi, Lucknow, Kutch, and Jaipur. Every piece carries an authenticated craftsman provenance certificate.",
                accent: "Varanasi · Lucknow · Jaipur",
              },
              {
                title: "Master Atelier Tailoring",
                description:
                  "Every bridal ensemble is tailored to precise specifications, crafted with master tailoring across our studio locations.",
                accent: "Refined Silhouette · Master Tailoring",
              },
              {
                title: "Sustainable Slow Fashion",
                description:
                  "We produce in limited runs. Zero factory mass-production. Only artisan workshops, natural dyes, and heirloom-grade materials that age beautifully across generations.",
                accent: "Limited Runs · Natural Dyes",
              },
            ].map((pillar, idx) => (
              <div key={idx} className="p-8 bg-[#FDFBF8] border border-[#EAE5DF]">
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#B58A76] font-semibold block mb-3">
                  {pillar.accent}
                </span>
                <h3 className="font-serif text-xl text-[#191919] mb-4">{pillar.title}</h3>
                <p className="font-sans text-xs text-[#77716D] leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Artisan Regional Hubs */}
      <section className="w-full px-6 sm:px-10 lg:px-14 py-20 max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-2">
            ARTISAN NETWORK
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#191919] mb-4">
            Regional Craft Hubs
          </h2>
          <p className="font-sans text-sm text-[#77716D] max-w-xl mx-auto leading-relaxed">
            Our atelier works directly with 70+ families of traditional karigars across six Indian states, eliminating middlemen and ensuring artisans receive their fair share.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { city: "Varanasi, UP", craft: "Banarasi Zari & Kinkhab Weaving", description: "14th-generation silk loom families weaving the gold and silver brocade that defines Indian bridal heritage." },
            { city: "Lucknow, UP", craft: "Chikankari & Zardozi Embroidery", description: "Mughali-era needle craft, rendered in white resham thread on sheer muslins and gossamer organzas." },
            { city: "Jaipur, Rajasthan", craft: "Meenakari & Kundan Jewellery", description: "Rajput royal enamel and gem-setting traditions preserved across four centuries of unbroken mastery." },
            { city: "Kutch, Gujarat", craft: "Bandhani & Mirror Work", description: "Intricate tie-dye patterns and reflective shisha embellishments by hereditary artisan communities." },
            { city: "Hyderabad, Telangana", craft: "Ikat & Pochampally Weaving", description: "Vibrant geometric ikats woven on traditional pit-looms using natural mineral colour pigments." },
            { city: "Kolkata, West Bengal", craft: "Baluchari & Muslin Weaving", description: "Heritage Bengali muslin so fine it is referred to as woven air, complemented by narrative Baluchari motifs." },
          ].map((hub, idx) => (
            <div key={idx} className="p-6 bg-[#F5F3F0] border border-[#EAE5DF] hover:border-[#7B5644] transition-colors">
              <div className="mb-3">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#B58A76] font-semibold">
                  {hub.city}
                </span>
                <h3 className="font-serif text-lg text-[#191919] mt-1">{hub.craft}</h3>
              </div>
              <p className="font-sans text-xs text-[#77716D] leading-relaxed">{hub.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Collections CTA Banner */}
      <section className="w-full bg-[#191919] text-[#FDFBF8] py-20 px-6 sm:px-10 lg:px-14">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#B58A76] font-semibold block mb-3">
            EXPLORE THE ATELIER
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl mb-6 font-normal">
            Discover Our Collections
          </h2>
          <p className="font-sans text-sm text-[#F5F3F0]/80 leading-relaxed mb-8 max-w-xl mx-auto">
            From bridal couture to ready-to-wear — explore every piece crafted by our master karigars and find yours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#FDFBF8] text-[#191919] text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#B58A76] hover:text-[#FDFBF8] transition-all"
            >
              <span>EXPLORE COLLECTIONS</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

