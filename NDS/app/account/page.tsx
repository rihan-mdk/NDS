"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  BadgeCheck,
  LogOut,
  Info,
  FileText,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  MapPin,
  Ruler,
  Package,
  Plus,
  X,
  Check,
  MessageCircle,
} from "lucide-react";

interface SavedDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface AddressItem {
  id: string;
  name: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface Measurements {
  height: string;
  bust: string;
  waist: string;
  hip: string;
  shoulder: string;
  dressLength: string;
}

export default function AccountProfilePage() {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<
    "details" | "address" | "measurements" | "terms" | "privacy" | "returns" | null
  >(null);

  const [savedDetails, setSavedDetails] = useState<SavedDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  const [addressFormData, setAddressFormData] = useState({
    name: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    isDefault: false,
  });

  const [measurements, setMeasurements] = useState<Measurements>({
    height: "5' 7\"",
    bust: "34\"",
    waist: "28\"",
    hip: "37\"",
    shoulder: "15.0\"",
    dressLength: "48\"",
  });

  const [activeDesktopTab, setActiveDesktopTab] = useState<
    "personal" | "addresses" | "measurements"
  >("personal");

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Load persisted patron details
    try {
      const storedDetails = localStorage.getItem("nds_saved_details");
      if (storedDetails) {
        setSavedDetails(JSON.parse(storedDetails));
      } else if (user) {
        const uName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split("@")[0] : "");
        const formatted = uName ? uName.charAt(0).toUpperCase() + uName.slice(1) : "";
        setSavedDetails((prev) => ({
          ...prev,
          fullName: formatted,
          email: user.email || "",
        }));
      }

      const storedAddresses = localStorage.getItem("nds_saved_addresses");
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }

      const storedMeasurements = localStorage.getItem("nds_measurements");
      if (storedMeasurements) {
        setMeasurements(JSON.parse(storedMeasurements));
      }
    } catch (e) {
      console.warn("Could not load stored account data:", e);
    }

    // Load orders count
    try {
      const savedOrders = JSON.parse(localStorage.getItem("nds_orders_history") || "[]");
      setOrdersCount(savedOrders.length);
    } catch (e) {
      console.warn("Could not load orders count:", e);
    }
  }, [user]);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nds_saved_details", JSON.stringify(savedDetails));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveModal(null);
      }, 1000);
    } catch (e) {
      console.warn("Could not save details:", e);
    }
  };

  const handleSaveMeasurements = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nds_measurements", JSON.stringify(measurements));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveModal(null);
      }, 1000);
    } catch (e) {
      console.warn("Could not save measurements:", e);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updated);
    try {
      localStorage.setItem("nds_saved_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save addresses:", e);
    }
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    if (!updated.some((a) => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    try {
      localStorage.setItem("nds_saved_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not delete address:", e);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressFormData.street.trim() || !addressFormData.city.trim() || !addressFormData.pincode.trim()) {
      return;
    }

    const newAddr: AddressItem = {
      id: `addr-${Date.now()}`,
      name: addressFormData.name.trim() || displayName,
      street: addressFormData.street.trim(),
      area: addressFormData.area.trim(),
      city: addressFormData.city.trim(),
      state: addressFormData.state.trim() || "India",
      pincode: addressFormData.pincode.trim(),
      phone: addressFormData.phone.trim() || displayPhone,
      isDefault: addresses.length === 0 || addressFormData.isDefault,
    };

    let updated = [...addresses];
    if (newAddr.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
      updated.unshift(newAddr);
    } else {
      updated.push(newAddr);
    }

    setAddresses(updated);
    try {
      localStorage.setItem("nds_saved_addresses", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save address:", err);
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveModal(null);
      setAddressFormData({
        name: "",
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        isDefault: false,
      });
    }, 600);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    router.push("/");
  };

  const userFallbackName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Patron";
  const formattedFallback =
    userFallbackName.charAt(0).toUpperCase() + userFallbackName.slice(1);

  const displayName = savedDetails.fullName || formattedFallback;
  const displayEmail = savedDetails.email || user?.email || "";
  const displayPhone = savedDetails.phone || "";

  return (
    <div className="w-full bg-[#FDFBF8] min-h-[calc(100vh-3.5rem)] text-[#191919]">

      {/* ══════════════════════════════════════════════════════════════
          1. MOBILE PROFILE VIEW (< lg:hidden)
          Matches Stitch screen "Profile - NEEL'S DESIGNER STUDIO"
      ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden w-full px-4 sm:px-6 pt-4 pb-24">

        {/* Top User Profile Section */}
        <section className="pt-2 pb-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#F5F3F0] flex items-center justify-center relative shadow-xs border border-[#E4E2DF]/60 mb-3">
            <UserIcon className="w-10 h-10 text-[#7B5644] stroke-[1.2]" />
          </div>
          <h1 className="font-serif text-2xl text-[#191919] font-normal tracking-wide">
            {displayName}
          </h1>
          <p className="font-sans text-[9px] text-[#7B5644] uppercase tracking-[0.25em] mt-1 font-semibold">
            NEEL&apos;S ATELIER
          </p>
        </section>

        {/* Primary Menu Items Card */}
        {isAdmin && (
          <div className="mb-5 p-4 bg-[#191919] text-[#FDFBF8] rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#C9A96E] font-semibold block">
                ADMIN PRIVILEGES
              </span>
              <p className="font-serif text-sm text-[#FDFBF8] mt-0.5">
                Atelier Management Portal
              </p>
            </div>
            <Link
              href="/admin"
              className="px-3.5 py-2 bg-[#C9A96E] text-[#191919] text-[10px] uppercase tracking-wider font-semibold hover:bg-white transition-colors rounded-xs"
            >
              Open Dashboard
            </Link>
          </div>
        )}

        <section className="mb-5">
          <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 overflow-hidden divide-y divide-[#EAE5DF]/70">
            {/* My Orders */}
            <Link
              href="/orders"
              className="flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] group-hover:bg-[#191919] group-hover:text-white transition-colors flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-sans text-[14px] text-[#191919] font-medium block">
                    My Orders
                  </span>
                  <span className="font-sans text-[12px] text-[#77716D] block truncate">
                    Track, view &amp; manage couture orders
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {ordersCount > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#F5F3F0] text-[#7B5644] rounded-full border border-[#EAE5DF]">
                    {ordersCount}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* My Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] group-hover:bg-[#191919] group-hover:text-white transition-colors flex-shrink-0">
                  <Heart className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-sans text-[14px] text-[#191919] font-medium block">
                    My Wishlist
                  </span>
                  <span className="font-sans text-[12px] text-[#77716D] block truncate">
                    Saved bespoke &amp; designer garments
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {wishlistItems.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#F5F3F0] text-[#7B5644] rounded-full border border-[#EAE5DF]">
                    {wishlistItems.length}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Saved Details */}
            <button
              type="button"
              onClick={() => setActiveModal("details")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] group-hover:bg-[#191919] group-hover:text-white transition-colors flex-shrink-0">
                  <BadgeCheck className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-sans text-[14px] text-[#191919] font-medium block">
                    Saved Details
                  </span>
                  <span className="font-sans text-[12px] text-[#77716D] block truncate">
                    Name, Email, Phone, Address
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Log Out */}
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#77716D] group-hover:text-[#BA1A1A] transition-colors flex-shrink-0">
                    <LogOut className="w-4 h-4 stroke-[1.6]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="font-sans text-[14px] text-[#191919] font-medium block">
                      Log Out
                    </span>
                    <span className="font-sans text-[12px] text-[#77716D] block truncate">
                      Sign out of your atelier account
                    </span>
                  </div>
                </div>
                <span className="font-sans text-[11px] font-semibold text-[#7B5644] hover:text-[#BA1A1A] uppercase tracking-widest flex-shrink-0">
                  LOGOUT
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] flex-shrink-0">
                    <UserIcon className="w-4 h-4 stroke-[1.6]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="font-sans text-[14px] text-[#191919] font-medium block">
                      Log Out
                    </span>
                    <span className="font-sans text-[12px] text-[#77716D] block truncate">
                      Sign out of your atelier account
                    </span>
                  </div>
                </div>
                <span className="font-sans text-[11px] font-semibold text-[#7B5644] uppercase tracking-widest flex-shrink-0">
                  LOGOUT
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* Atelier & Company (About Us) */}
        <section className="mb-5">
          <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 overflow-hidden">
            <Link
              href="/about"
              className="flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] group-hover:bg-[#191919] group-hover:text-white transition-colors flex-shrink-0">
                  <Info className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-sans text-[14px] text-[#191919] font-medium block">
                    About Us
                  </span>
                  <span className="font-sans text-[12px] text-[#77716D] block truncate">
                    Heritage, craftsmanship &amp; philosophy
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          </div>
        </section>

        {/* Customer Care Section */}
        <section className="mb-5">
          <span className="font-sans text-[10px] uppercase text-[#77716D] tracking-[0.2em] font-semibold block mb-2 px-1">
            CUSTOMER CARE
          </span>
          <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 overflow-hidden divide-y divide-[#EAE5DF]/70">
            {/* Terms Of Use */}
            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <FileText className="w-4 h-4 text-[#77716D] stroke-[1.5] flex-shrink-0" />
                <span className="font-sans text-[14px] text-[#191919] block">
                  Terms Of Use
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <ShieldCheck className="w-4 h-4 text-[#77716D] stroke-[1.5] flex-shrink-0" />
                <span className="font-sans text-[14px] text-[#191919] block">
                  Privacy Policy
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>

            {/* Return Policy */}
            <button
              type="button"
              onClick={() => setActiveModal("returns")}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <RotateCcw className="w-4 h-4 text-[#77716D] stroke-[1.5] flex-shrink-0" />
                <span className="font-sans text-[14px] text-[#191919] block">
                  Return Policy
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#77716D] group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
          </div>
        </section>

        {/* Follow Us Section */}
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 p-4 flex items-center justify-between">
            <span className="font-sans text-[14px] text-[#191919] font-medium tracking-wide">
              Follow Us
            </span>
            <div className="flex items-center gap-3">
              {/* WhatsApp */}
              <a
                aria-label="WhatsApp"
                href="https://wa.me/919999999999?text=Hello%20Neel%27s%20Designer%20Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#191919] hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.33C9.35 7.33 9.05 7.4 8.8 7.67C8.55 7.94 7.85 8.6 7.85 9.94C7.85 11.28 8.83 12.57 8.97 12.75C9.11 12.94 10.9 15.68 13.64 16.86C14.29 17.14 14.8 17.31 15.2 17.44C15.86 17.65 16.46 17.62 16.93 17.55C17.46 17.47 18.56 16.88 18.79 16.24C19.02 15.6 19.02 15.05 18.95 14.94C18.88 14.83 18.7 14.77 18.42 14.63C18.15 14.5 16.85 13.86 16.61 13.77C16.38 13.69 16.21 13.64 16.05 13.91C15.88 14.19 15.4 14.77 15.25 14.94C15.11 15.11 14.97 15.13 14.69 15C14.42 14.86 13.54 14.57 12.49 13.64C11.68 12.92 11.13 12.03 10.97 11.76C10.81 11.48 10.95 11.34 11.09 11.2C11.22 11.07 11.38 10.86 11.51 10.7C11.65 10.54 11.7 10.42 11.79 10.24C11.88 10.06 11.83 9.91 11.76 9.77C11.7 9.63 11.19 8.38 10.97 7.88C10.77 7.39 10.56 7.45 10.4 7.45C10.24 7.44 10.05 7.44 9.87 7.44L9.53 7.33Z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#191919] hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-colors"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          2. DESKTOP ACCOUNT VIEW (hidden lg:block)
          Matches Stitch screen "Desktop My Account - NEEL'S DESIGNER STUDIO"
      ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full max-w-[1360px] mx-auto px-8 md:px-12 py-8 sm:py-12">

        {/* Minimal Page Header */}
        <div className="pb-8 border-b border-[#EAE5DF]">
          <h1 className="font-serif text-3xl md:text-4xl text-[#191919] font-normal tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-[#77716D] mt-2 font-light">
            Manage your personal details and preferences.
          </p>
        </div>

        {/* Account Management Grid */}
        <div className="grid grid-cols-12 gap-10 mt-8 items-start">

          {/* ── Left Sidebar Navigation (col-span-3) ── */}
          <aside className="col-span-3 sticky top-24 space-y-6">
            <nav
              aria-label="Account Navigation"
              className="flex flex-col border border-[#EAE5DF] bg-white divide-y divide-[#EAE5DF]/60 shadow-xs rounded-sm overflow-hidden"
            >
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-5 py-4 text-xs uppercase tracking-widest font-semibold transition-colors text-left bg-[#191919] text-[#C9A96E] hover:bg-[#25221D]"
                >
                  <ShieldCheck className="w-[18px] h-[18px] text-[#C9A96E]" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => setActiveDesktopTab("personal")}
                className={`flex items-center gap-3 px-5 py-4 text-xs uppercase tracking-widest font-medium transition-colors text-left ${
                  activeDesktopTab === "personal"
                    ? "bg-[#F5F3F0] text-[#191919] border-l-2 border-[#191919]"
                    : "text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60"
                }`}
              >
                <UserIcon className="w-[18px] h-[18px]" />
                <span>Personal Information</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDesktopTab("addresses")}
                className={`flex items-center gap-3 px-5 py-4 text-xs uppercase tracking-widest font-medium transition-colors text-left ${
                  activeDesktopTab === "addresses"
                    ? "bg-[#F5F3F0] text-[#191919] border-l-2 border-[#191919]"
                    : "text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60"
                }`}
              >
                <MapPin className="w-[18px] h-[18px]" />
                <span>Saved Addresses</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDesktopTab("measurements")}
                className={`flex items-center gap-3 px-5 py-4 text-xs uppercase tracking-widest font-medium transition-colors text-left ${
                  activeDesktopTab === "measurements"
                    ? "bg-[#F5F3F0] text-[#191919] border-l-2 border-[#191919]"
                    : "text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60"
                }`}
              >
                <Ruler className="w-[18px] h-[18px]" />
                <span>My Measurements</span>
              </button>

              <Link
                href="/orders"
                className="flex items-center justify-between px-5 py-4 text-xs uppercase tracking-widest font-medium text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-[18px] h-[18px]" />
                  <span>My Orders</span>
                </div>
                {ordersCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3F0] text-[#7B5644] font-semibold">
                    {ordersCount}
                  </span>
                )}
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center justify-between px-5 py-4 text-xs uppercase tracking-widest font-medium text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-[18px] h-[18px]" />
                  <span>Wishlist</span>
                </div>
                {wishlistItems.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3F0] text-[#7B5644] font-semibold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 px-5 py-4 text-xs uppercase tracking-widest font-medium text-[#77716D] hover:text-[#BA1A1A] hover:bg-[#F5F3F0]/60 transition-colors text-left"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Atelier Concierge Prompt */}
            <div className="border border-[#EAE5DF] bg-[#F5F3F0] p-5 rounded-sm">
              <span className="text-[10px] uppercase tracking-widest text-[#7B5644] font-semibold block mb-1.5">
                ATELIER CONCIERGE
              </span>
              <p className="text-xs text-[#77716D] leading-relaxed mb-3.5">
                Need bespoke measurements or personal wedding styling? Our atelier masters are available.
              </p>
              <a
                href="https://wa.me/919999999999?text=Hello%2C%20I%20would%20like%20to%20consult%20an%20atelier%20stylist"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#191919] hover:text-[#7B5644] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp Stylist</span>
              </a>
            </div>
          </aside>

          {/* ── Right Content Dossier (col-span-9) ── */}
          <div className="col-span-9 space-y-10">

            {/* SECTION 1: Personal Information */}
            <section
              className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs"
              id="personal-info"
            >
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE5DF]">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    Personal Information
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal("details")}
                  className="px-5 py-2 border border-[#191919] text-[#191919] hover:bg-[#191919] hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                >
                  Edit Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#77716D]">
                    Full Name
                  </span>
                  <p className="text-base text-[#191919] font-medium">{displayName}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#77716D]">
                    Email Address
                  </span>
                  <p className="text-base text-[#191919] font-medium">{displayEmail}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#77716D]">
                    Mobile Number
                  </span>
                  <p className="text-base text-[#191919] font-medium">{displayPhone}</p>
                </div>
              </div>
            </section>

            {/* SECTION 2: Saved Addresses */}
            <section
              className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs"
              id="saved-addresses"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    Saved Addresses
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal("address")}
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-[#191919] text-white hover:bg-[#7B5644] transition-colors duration-200 text-xs uppercase tracking-widest font-medium self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <p className="text-sm text-[#77716D]">No saved delivery addresses yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressFormData({
                        name: displayName,
                        street: "",
                        area: "",
                        city: "",
                        state: "",
                        pincode: "",
                        phone: displayPhone,
                        isDefault: true,
                      });
                      setActiveModal("address");
                    }}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#191919] text-white hover:bg-[#7B5644] transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Delivery Address</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`border border-[#EAE5DF] p-6 flex flex-col justify-between ${
                        addr.isDefault ? "bg-[#F9F8F5]/80" : "bg-[#F9F8F5]/30"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-[#191919] tracking-wide">
                            {addr.name}
                          </span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 text-[9px] uppercase tracking-widest font-semibold border border-[#191919] text-[#191919] bg-white">
                              Default Address
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#77716D] leading-relaxed space-y-1">
                          <p>{addr.street}</p>
                          <p>{addr.area}</p>
                          <p>
                            {addr.city}, {addr.state} {addr.pincode}, India
                          </p>
                          <p className="pt-2 text-[#191919] font-medium">Phone: {addr.phone}</p>
                        </div>
                      </div>

                      <div className="pt-6 mt-4 border-t border-[#EAE5DF] flex items-center justify-between text-xs">
                        {!addr.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="uppercase tracking-widest font-medium text-[#7B5644] hover:underline transition-colors"
                          >
                            Set as Default
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#77716D] uppercase tracking-wider">
                            Primary
                          </span>
                        )}
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setAddressFormData({
                                name: addr.name,
                                street: addr.street,
                                area: addr.area,
                                city: addr.city,
                                state: addr.state,
                                pincode: addr.pincode,
                                phone: addr.phone,
                                isDefault: addr.isDefault,
                              });
                              setActiveModal("address");
                            }}
                            className="uppercase tracking-widest font-medium text-[#191919] hover:text-[#7B5644] transition-colors"
                          >
                            Edit
                          </button>
                          <span className="text-[#EAE5DF]">|</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="uppercase tracking-widest font-medium text-[#77716D] hover:text-[#BA1A1A] transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: My Measurements */}
            <section
              className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs"
              id="my-measurements"
            >
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE5DF]">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    My Measurements
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal("measurements")}
                  className="px-5 py-2 border border-[#191919] text-[#191919] hover:bg-[#191919] hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                >
                  Edit Measurements
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-6">
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Height
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.height}
                  </span>
                  <span className="text-[10px] text-[#77716D]">170 cm</span>
                </div>
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Bust
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.bust}
                  </span>
                  <span className="text-[10px] text-[#77716D]">inches</span>
                </div>
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Waist
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.waist}
                  </span>
                  <span className="text-[10px] text-[#77716D]">inches</span>
                </div>
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Hip
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.hip}
                  </span>
                  <span className="text-[10px] text-[#77716D]">inches</span>
                </div>
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Shoulder
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.shoulder}
                  </span>
                  <span className="text-[10px] text-[#77716D]">inches</span>
                </div>
                <div className="border border-[#EAE5DF]/70 p-4 bg-[#F9F8F5]/50">
                  <span className="text-[10px] uppercase tracking-widest text-[#77716D] block mb-1">
                    Dress Length
                  </span>
                  <span className="font-serif text-xl text-[#191919] block">
                    {measurements.dressLength}
                  </span>
                  <span className="text-[10px] text-[#77716D]">inches</span>
                </div>
              </div>
            </section>

            {/* Quick Policies / Atelier Assurance row */}
            <div className="flex items-center justify-between p-4 border border-[#EAE5DF] bg-[#F5F3F0]/60 rounded-sm">
              <span className="text-xs uppercase tracking-widest text-[#77716D]">
                Patron Policies &amp; Assurance:
              </span>
              <div className="flex items-center gap-6 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModal("terms")}
                  className="text-[#77716D] hover:text-[#191919] underline uppercase tracking-wider"
                >
                  Terms of Use
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("privacy")}
                  className="text-[#77716D] hover:text-[#191919] underline uppercase tracking-wider"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("returns")}
                  className="text-[#77716D] hover:text-[#191919] underline uppercase tracking-wider"
                >
                  Return Policy
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODALS FOR DETAILS, ADDRESS, MEASUREMENTS & POLICIES
      ══════════════════════════════════════════════════════════════ */}

      {/* 1. Saved Details / Personal Information Editor Modal */}
      {activeModal === "details" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-md w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              ATELIER PATRON RECORD
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Personal Details</h3>

            <form onSubmit={handleSaveDetails} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={savedDetails.fullName}
                  onChange={(e) => setSavedDetails({ ...savedDetails, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={savedDetails.email}
                  onChange={(e) => setSavedDetails({ ...savedDetails, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={savedDetails.phone}
                  onChange={(e) => setSavedDetails({ ...savedDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Delivery Address
                </label>
                <input
                  type="text"
                  required
                  value={savedDetails.address}
                  onChange={(e) => setSavedDetails({ ...savedDetails, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={savedDetails.city}
                    onChange={(e) => setSavedDetails({ ...savedDetails, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={savedDetails.pincode}
                    onChange={(e) => setSavedDetails({ ...savedDetails, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-xs text-[#77716D] hover:text-[#191919] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644] transition-colors flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Address Modal */}
      {activeModal === "address" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-md w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              DELIVERY DESTINATION
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Add / Edit Address</h3>

            <form
              onSubmit={handleSaveAddress}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={displayName || "Full Name"}
                  value={addressFormData.name}
                  onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Address Line 1 (Villa / Flat / Street)
                </label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Apartment, Street"
                  value={addressFormData.street}
                  onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Area / Landmark
                </label>
                <input
                  type="text"
                  placeholder="Area, Colony or Landmark"
                  value={addressFormData.area}
                  onChange={(e) => setAddressFormData({ ...addressFormData, area: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="6-digit PIN"
                    value={addressFormData.pincode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder={displayPhone || "+91 Phone Number"}
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="accent-[#191919] w-3.5 h-3.5"
                />
                <span className="text-[11px] text-[#77716D]">Make this my default delivery address</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-xs text-[#77716D] hover:text-[#191919] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644] transition-colors flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Edit Measurements Modal */}
      {activeModal === "measurements" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              HAUTE COUTURE SPECIFICATIONS
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Edit Measurements</h3>

            <form onSubmit={handleSaveMeasurements} className="space-y-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={measurements.height}
                    onChange={(e) => setMeasurements({ ...measurements, height: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Bust
                  </label>
                  <input
                    type="text"
                    value={measurements.bust}
                    onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Waist
                  </label>
                  <input
                    type="text"
                    value={measurements.waist}
                    onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Hip
                  </label>
                  <input
                    type="text"
                    value={measurements.hip}
                    onChange={(e) => setMeasurements({ ...measurements, hip: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Shoulder
                  </label>
                  <input
                    type="text"
                    value={measurements.shoulder}
                    onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Dress Length
                  </label>
                  <input
                    type="text"
                    value={measurements.dressLength}
                    onChange={(e) =>
                      setMeasurements({ ...measurements, dressLength: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-xs text-[#77716D] hover:text-[#191919] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644] transition-colors flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save Measurements</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Customer Care: Terms Of Use Modal */}
      {activeModal === "terms" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              CLIENT TERMS
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Terms Of Use</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <p>
                All couture designs, textile motifs, and imagery shown on this platform are original intellectual creations of Neel&apos;s Designer Studio.
              </p>
              <p>
                Prices listed in INR are inclusive of applicable GST taxes. Bespoke tailoring orders commence once initial specifications are confirmed.
              </p>
              <p>
                Orders may be cancelled within 24 hours of placement prior to master karigari cutting.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Customer Care: Privacy Policy Modal */}
      {activeModal === "privacy" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              PRIVACY COMMITMENT
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Privacy Policy</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <p>
                Neel&apos;s Designer Studio respects your personal discretion. We collect only essential information required for order fulfillment and personalized bespoke consultation.
              </p>
              <p>
                Your measurements, styling preferences, and payment details are securely encrypted and never shared with third parties.
              </p>
              <p>
                You may request complete removal of your patron profile data at any time through our concierge.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Customer Care: Return Policy Modal */}
      {activeModal === "returns" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-1">
              ATELIER ASSURANCE
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Return &amp; Exchange Policy</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <p>
                Standard size ready-to-wear pieces may be exchanged within 7 days of delivery in unused condition with atelier security tags intact.
              </p>
              <p>
                <strong>Custom Tailored &amp; Bridal Couture:</strong> Accompanied by complimentary lifetime fitting alterations through our WhatsApp Concierge.
              </p>
              <p>
                To initiate an exchange or fitting adjustment, contact your dedicated concierge team with your order number.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
