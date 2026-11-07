import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FDFBF8] text-[#191919] min-h-screen flex flex-col font-sans selection:bg-[#191919] selection:text-[#FDFBF8]">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1 pt-14 pb-[94px] lg:pb-0">{children}</main>
              <Footer />
              <MobileBottomNav />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

