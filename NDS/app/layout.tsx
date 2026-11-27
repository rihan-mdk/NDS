import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neels-designer-studio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Neel's Designer Studio | Luxury Fashion Boutique & Imperial Couture",
    template: "%s | Neel's Designer Studio",
  },
  description:
    "Impeccably tailored luxury fashion boutique in Moodbiri featuring imperial lehengas, bridal couture, evening drape gowns, artisanal short kurtis, and fine jewels.",
  keywords: [
    "NEEL'S DESIGNER STUDIO",
    "Neel's Designer Studio",
    "Neels Designer Studio",
    "Neels",
    "Neel's",
    "Neels Moodbiri",
    "Neel's Designer Studio Moodbiri",
    "Luxury Fashion Boutique Moodbiri",
    "Bridal Couture Karnataka",
    "Imperial Lehengas",
    "Designer Gowns",
    "Artisanal Short Kurtis",
    "Fine Jewellery Moodbiri",
    "Indian High Couture",
    "Iruvail Road Boutique Moodbiri",
  ],
  authors: [{ name: "Neel's Designer Studio", url: siteUrl }],
  creator: "Neel's Designer Studio",
  publisher: "Neel's Designer Studio",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Neel's Designer Studio",
    title: "Neel's Designer Studio | Luxury Fashion Boutique & Imperial Couture",
    description:
      "Impeccably tailored luxury fashion boutique in Moodbiri featuring imperial lehengas, bridal couture, evening drape gowns, artisanal short kurtis, and fine jewels.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Neel's Designer Studio - Luxury Fashion Boutique in Moodbiri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Neel's Designer Studio | Luxury Fashion Boutique & Imperial Couture",
    description:
      "Impeccably tailored luxury fashion boutique in Moodbiri featuring imperial lehengas, bridal couture, evening drape gowns, artisanal short kurtis, and fine jewels.",
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["ClothingStore", "LocalBusiness"],
        "@id": `${siteUrl}/#store`,
        name: "Neel's Designer Studio",
        alternateName: [
          "Neels Designer Studio",
          "Neels",
          "Neel's",
          "Neels Boutique",
          "Neel's Fashion Boutique",
        ],
        url: siteUrl,
        logo: `${siteUrl}/images/hero.jpg`,
        image: `${siteUrl}/images/hero.jpg`,
        description:
          "Impeccably tailored luxury fashion boutique in Moodbiri featuring imperial lehengas, bridal couture, evening drape gowns, artisanal short kurtis, and fine jewels.",
        telephone: "+918123200215",
        priceRange: "₹₹₹₹",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Iruvail Road",
          addressLocality: "Moodbiri",
          addressRegion: "Karnataka",
          postalCode: "574227",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "13.0694",
          longitude: "74.9961",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "20:00",
          },
        ],
        sameAs: [
          "https://www.instagram.com/neels_designer_studio?avpt=aDk1emZ3aHVicDZl",
        ],
        hasMap: "https://maps.google.com/?q=Moodbiri+Iruvail+Road+574227",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Neel's Designer Studio",
        alternateName: "Neels Designer Studio",
        publisher: {
          "@id": `${siteUrl}/#store`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FDFBF8] text-[#191919] min-h-screen flex flex-col font-sans selection:bg-[#191919] selection:text-[#FDFBF8]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1 pt-14 pb-[90px] lg:pb-0">{children}</main>
              <Footer />
              <WhatsAppButton />
              <MobileBottomNav />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

