import type { Metadata } from "next";
import { headers } from "next/headers";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

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

export const metadata: Metadata = {
  title: "NEEL'S DESIGNER STUDIO | Luxury Fashion Boutique & Imperial Couture",
  description:
    "Impeccably tailored luxury fashion boutique featuring imperial lehengas, bridal couture, evening drape gowns, artisanal short kurtis, and fine jewels.",
  keywords: [
    "NEEL'S DESIGNER STUDIO",
    "Luxury Fashion Boutique",
    "Bridal Couture",
    "Lehenga Collection",
    "Gowns",
    "Fine Jewellery",
    "Indian High Couture",
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning className="bg-[#FDFBF8] text-[#191919] min-h-screen flex flex-col font-sans selection:bg-[#191919] selection:text-[#FDFBF8]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1 pt-14 pb-[90px] lg:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

