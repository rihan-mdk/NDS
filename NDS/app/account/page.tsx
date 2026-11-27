"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { INDIAN_STATES_LIST, detectStateFromPincode } from "@/lib/shipping";
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
  KeyRound,
  Lock,
  AlertCircle,
  Loader2,
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
  const { user, signOut, isAdmin, loading, resetPassword } = useAuth();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const router = useRouter();

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [activeModal, setActiveModal] = useState<
    "details" | "address" | "measurements" | "terms" | "privacy" | "returns" | "deleteAccount" | "credentials" | null
  >(null);

  // Credentials & Security state (Name, Email, Password edit & reset)
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [credentialName, setCredentialName] = useState("");
  const [credentialEmail, setCredentialEmail] = useState("");
  const [credentialNewPassword, setCredentialNewPassword] = useState("");
  const [credentialConfirmPassword, setCredentialConfirmPassword] = useState("");
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [credentialSuccess, setCredentialSuccess] = useState<string | null>(null);
  const [credentialError, setCredentialError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmailLoading, setResetEmailLoading] = useState(false);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [localDataCleared, setLocalDataCleared] = useState(false);

  const handleClearLocalData = () => {
    try {
      localStorage.removeItem("nds_saved_details");
      localStorage.removeItem("nds_saved_addresses");
      localStorage.removeItem("nds_measurements");
      localStorage.removeItem("nds_orders_history");
      sessionStorage.removeItem("nds_last_order");
      setLocalDataCleared(true);
      setTimeout(() => setLocalDataCleared(false), 3000);
    } catch (e) {
      console.warn("Could not clear local device data:", e);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError("");
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleClearLocalData();
        await signOut();
        router.push("/?deleted=true");
      } else {
        setDeleteAccountError(data.error || "Failed to process account deletion.");
      }
    } catch {
      setDeleteAccountError("Network error while processing deletion request.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

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
    "personal" | "orders" | "addresses" | "measurements"
  >("personal");

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // 1. Load from localStorage immediately (instant render)
    try {
      const storedDetails = localStorage.getItem("nds_saved_details");
      if (storedDetails) {
        const parsed = JSON.parse(storedDetails);
        if (!user?.email || !parsed?.email || parsed.email.toLowerCase() === user.email.toLowerCase()) {
          setSavedDetails(parsed);
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
            phone: user.user_metadata?.phone || prev.phone || "",
          }));
        }
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
      if (storedAddresses) setAddresses(JSON.parse(storedAddresses));

      const storedMeasurements = localStorage.getItem("nds_measurements");
      if (storedMeasurements) setMeasurements(JSON.parse(storedMeasurements));
    } catch (e) {
      console.warn("Could not load stored account data:", e);
    }

    // Load orders from localStorage and sessionStorage for instant UI - strictly isolated to current user
    try {
      const isOrderOwnedByUser = (order: any) => {
        if (!user || !user.id) return false;
        const orderUserId = order.user_id || order.userId;
        const orderEmail = order.customer_email || order.customer?.email || order.email;
        if (orderUserId && orderUserId !== user.id) return false;
        if (orderEmail && user.email && orderEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) return false;
        if (orderUserId === user.id) return true;
        if (orderEmail && user.email && orderEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) return true;
        return false;
      };

      const savedOrders = JSON.parse(localStorage.getItem("nds_orders_history") || "[]");
      const sessionStored = sessionStorage.getItem("nds_last_order");
      const sessionOrder = sessionStored ? [JSON.parse(sessionStored)] : [];
      const userMatchedOrders = [...sessionOrder, ...savedOrders].filter(
        (o, idx, arr) => arr.findIndex((item) => item.id === o.id) === idx && isOrderOwnedByUser(o)
      );
      setUserOrders(userMatchedOrders);
      setOrdersCount(userMatchedOrders.length);
    } catch (e) {
      console.warn("Could not load orders count:", e);
    }

    // 2. Sync from Supabase if logged in
    if (!user?.id) return;

    const supabase = createClient();

    const syncFromSupabase = async () => {
      // Fetch profile (name, phone, measurements)
      try {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, measurements")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setSavedDetails((prev) => {
            const updated = {
              ...prev,
              fullName: data.full_name || prev.fullName,
              phone: data.phone || prev.phone,
            };
            try { localStorage.setItem("nds_saved_details", JSON.stringify(updated)); } catch { /* noop */ }
            return updated;
          });
          if (data.measurements && Object.keys(data.measurements).length > 0) {
            setMeasurements(data.measurements);
            try { localStorage.setItem("nds_measurements", JSON.stringify(data.measurements)); } catch { /* noop */ }
          }
        } else {
          // Auto-seed patron profile in Supabase if not yet present
          const defaultName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            (user.email ? user.email.split("@")[0] : "Atelier Patron");
          await supabase.from("profiles").upsert({
            id: user.id,
            full_name: defaultName,
            updated_at: new Date().toISOString(),
          });
        }
      } catch { /* noop */ }

      // Fetch saved addresses
      try {
        const { data } = await supabase
          .from("user_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = data.map((a: any) => ({
            id: a.id,
            name: a.name || "",
            street: a.street || "",
            area: a.area || "",
            city: a.city || "",
            state: a.state || "",
            pincode: a.pincode || "",
            phone: a.phone || "",
            isDefault: a.is_default || false,
          }));
          setAddresses(mapped);
          try { localStorage.setItem("nds_saved_addresses", JSON.stringify(mapped)); } catch { /* noop */ }
        } else {
          // If Supabase has no addresses but local storage does, sync them up
          const localAddrs = JSON.parse(localStorage.getItem("nds_saved_addresses") || "[]");
          if (Array.isArray(localAddrs) && localAddrs.length > 0) {
            for (const addr of localAddrs) {
              await supabase.from("user_addresses").upsert({
                id: addr.id || `addr-${Date.now()}`,
                user_id: user.id,
                name: addr.name,
                street: addr.street,
                area: addr.area || "",
                city: addr.city,
                state: addr.state || "India",
                pincode: addr.pincode,
                phone: addr.phone,
                is_default: addr.isDefault || false,
              });
            }
          }
        }
      } catch { /* noop */ }

      // Fetch orders and items from server API
      try {
        const emailParam = user.email ? `&email=${encodeURIComponent(user.email)}` : "";
        const res = await fetch(`/api/admin/orders?userId=${user.id}${emailParam}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            // Authoritative orders for this user from Supabase
            setUserOrders(data.orders);
            setOrdersCount(data.orders.length);
          }
        }
      } catch { /* noop */ }
    };

    syncFromSupabase();
  }, [user]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nds_saved_details", JSON.stringify(savedDetails));
    } catch (e) {
      console.warn("Could not save details locally:", e);
    }
    // Sync to Supabase profiles table
    if (user?.id) {
      try {
        const supabase = createClient();
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: savedDetails.fullName,
          phone: savedDetails.phone,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not sync profile to cloud:", err);
      }
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveModal(null);
    }, 1000);
  };

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("nds_measurements", JSON.stringify(measurements));
    } catch (e) {
      console.warn("Could not save measurements locally:", e);
    }
    // Sync to Supabase profiles table (measurements stored as JSONB)
    if (user?.id) {
      try {
        const supabase = createClient();
        await supabase.from("profiles").upsert({
          id: user.id,
          measurements,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Could not sync measurements to cloud:", err);
      }
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveModal(null);
    }, 1000);
  };

  const handleSetDefaultAddress = async (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updated);
    try {
      localStorage.setItem("nds_saved_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save addresses locally:", e);
    }
    // Sync default flag to Supabase
    if (user?.id) {
      try {
        const supabase = createClient();
        // Clear all defaults for this user, then set the chosen one
        await supabase
          .from("user_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
        await supabase
          .from("user_addresses")
          .update({ is_default: true })
          .eq("id", id);
      } catch (err) {
        console.warn("Could not sync default address to cloud:", err);
      }
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    if (!updated.some((a) => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    try {
      localStorage.setItem("nds_saved_addresses", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not delete address locally:", e);
    }
    // Delete from Supabase
    if (user?.id) {
      try {
        const supabase = createClient();
        await supabase.from("user_addresses").delete().eq("id", id);
        // If we promoted a new default, update it
        if (updated.length > 0 && updated[0].isDefault) {
          await supabase
            .from("user_addresses")
            .update({ is_default: true })
            .eq("id", updated[0].id);
        }
      } catch (err) {
        console.warn("Could not delete address from cloud:", err);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
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
      console.warn("Could not save address locally:", err);
    }

    // Sync to Supabase user_addresses table
    if (user?.id) {
      try {
        const supabase = createClient();
        // If this is the new default, clear all existing defaults first
        if (newAddr.isDefault) {
          await supabase
            .from("user_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);
        }
        await supabase.from("user_addresses").upsert({
          id: newAddr.id,
          user_id: user.id,
          name: newAddr.name,
          street: newAddr.street,
          area: newAddr.area,
          city: newAddr.city,
          state: newAddr.state,
          pincode: newAddr.pincode,
          phone: newAddr.phone,
          is_default: newAddr.isDefault,
        });
      } catch (err) {
        console.warn("Could not sync address to cloud:", err);
      }
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

  useEffect(() => {
    if (!isEditingCredentials && activeModal !== "credentials") {
      setCredentialName(displayName);
      setCredentialEmail(displayEmail);
    }
  }, [displayName, displayEmail, isEditingCredentials, activeModal]);

  const handleTriggerPasswordReset = async () => {
    const targetEmail = credentialEmail.trim() || displayEmail.trim();
    if (!targetEmail) {
      setCredentialError("Please provide an email address to send the reset link.");
      return;
    }

    setResetEmailLoading(true);
    setCredentialError(null);
    try {
      const { error } = await resetPassword(targetEmail);
      if (error) {
        throw error;
      }
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 8000);
    } catch (err: any) {
      setCredentialError(err.message || "Could not send password reset email. Please try again.");
    } finally {
      setResetEmailLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialLoading(true);
    setCredentialError(null);
    setCredentialSuccess(null);

    const supabase = createClient();
    const cleanName = credentialName.trim();
    const cleanEmail = credentialEmail.trim().toLowerCase();

    // Validate password if provided
    if (credentialNewPassword) {
      if (credentialNewPassword.length < 6) {
        setCredentialError("New password must be at least 6 characters long.");
        setCredentialLoading(false);
        return;
      }
      if (credentialNewPassword !== credentialConfirmPassword) {
        setCredentialError("Passwords do not match. Please verify both fields.");
        setCredentialLoading(false);
        return;
      }
    }

    try {
      const successMessages: string[] = [];
      const authUpdates: {
        email?: string;
        password?: string;
        data?: { full_name?: string };
      } = {};

      if (cleanName && cleanName !== displayName) {
        authUpdates.data = { full_name: cleanName };
      }

      if (cleanEmail && cleanEmail !== displayEmail) {
        authUpdates.email = cleanEmail;
      }

      if (credentialNewPassword) {
        authUpdates.password = credentialNewPassword;
      }

      // If user is logged in via Supabase, update auth record
      if (user && Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) {
          throw new Error(authError.message);
        }

        if (authUpdates.email) {
          successMessages.push("Verification link dispatched to your new email.");
        }
        if (authUpdates.password) {
          successMessages.push("Password updated successfully.");
        }
        if (authUpdates.data?.full_name) {
          successMessages.push("Name updated successfully.");
        }
      }

      // Update local storage & database profile
      const updatedDetails: SavedDetails = {
        ...savedDetails,
        fullName: cleanName || savedDetails.fullName,
        email: cleanEmail || savedDetails.email,
      };

      setSavedDetails(updatedDetails);
      try {
        localStorage.setItem("nds_saved_details", JSON.stringify(updatedDetails));
      } catch {}

      if (user?.id) {
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: cleanName,
          updated_at: new Date().toISOString(),
        });
      }

      setCredentialNewPassword("");
      setCredentialConfirmPassword("");
      setCredentialSuccess(
        successMessages.length > 0
          ? successMessages.join(" ")
          : "Profile details updated successfully."
      );

      setTimeout(() => {
        setIsEditingCredentials(false);
        setActiveModal(null);
        setCredentialSuccess(null);
      }, 2000);
    } catch (err: any) {
      setCredentialError(err.message || "Failed to update profile credentials.");
    } finally {
      setCredentialLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#FDFBF8] min-h-[calc(100vh-3.5rem)] text-[#191919]">

      {/* ══════════════════════════════════════════════════════════════
          1. MOBILE PROFILE VIEW (< lg:hidden)
          Matches Stitch screen "Profile - NEEL'S DESIGNER STUDIO"
      ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden w-full px-4 sm:px-6 pt-4 pb-24">

        {/* ── Auth Loading Skeleton (mobile) ── */}
        {loading ? (
          <div className="flex flex-col items-center pt-6 pb-4 gap-4">
            {/* Avatar */}
            <Skeleton className="w-20 h-20 rounded-full" />
            {/* Name */}
            <Skeleton className="h-6 w-36" />
            {/* Sub-label */}
            <Skeleton className="h-3 w-24" />
            {/* 3 stat cards */}
            <div className="w-full grid grid-cols-3 gap-3 mt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            {/* Menu rows */}
            <div className="w-full flex flex-col gap-3 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl w-full" />
              ))}
            </div>
          </div>
        ) : (<>

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

        {/* Recent Ordered Items (Mobile) */}
        {userOrders.length > 0 && (
          <section className="mb-5">
            <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE5DF]">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#7B5644]" />
                  <span className="font-sans text-xs uppercase tracking-wider font-semibold text-[#191919]">
                    Ordered Items
                  </span>
                </div>
                <Link
                  href="/orders"
                  className="text-[10px] uppercase tracking-wider text-[#7B5644] font-semibold hover:underline"
                >
                  View All ({userOrders.length})
                </Link>
              </div>

              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="p-3 bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-[#77716D]">
                      <span className="font-mono font-semibold text-[#191919]">{order.id}</span>
                      <span
                        className={`px-2 py-0.5 uppercase tracking-wider font-semibold rounded-full text-[9px] ${
                          order.status === "Payment Pending"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : order.status === "Confirmed"
                            ? "bg-[#F5EAE1] text-[#7B5644] border border-[#EAE5DF]"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {order.items.map((item: any, idx: number) => {
                          const title = item.product?.title || item.productTitle || "Bespoke Atelier Garment";
                          const image = item.product?.images?.[0] || item.productImage || "";
                          const size = item.selectedSize || item.size || "";
                          const price = item.product?.price || item.unitPrice || 0;
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-12 h-14 bg-white border border-[#EAE5DF] overflow-hidden flex-shrink-0">
                                {image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={image} alt={title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#F5F3F0] text-[9px] text-[#77716D]">
                                    Piece
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-serif text-xs text-[#191919] truncate">{title}</p>
                                <p className="text-[11px] text-[#77716D]">
                                  {size ? `Size: ${size}` : ""} {item.quantity ? `· Qty: ${item.quantity}` : ""}
                                </p>
                                <p className="text-xs font-semibold text-[#191919]">
                                  ₹{Number(price).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#EAE5DF] flex items-center justify-between text-[11px]">
                      <span className="text-[#77716D]">
                        Total: <strong className="text-[#191919]">₹{Number(order.total).toLocaleString("en-IN")}</strong>
                      </span>
                      <Link
                        href={`/orders?id=${order.id}`}
                        className="text-[#7B5644] font-semibold uppercase tracking-wider text-[10px] hover:underline"
                      >
                        Track Order →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
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

            {/* Login & Security */}
            <button
              type="button"
              onClick={() => {
                setCredentialName(displayName);
                setCredentialEmail(displayEmail);
                setCredentialNewPassword("");
                setCredentialConfirmPassword("");
                setCredentialError(null);
                setCredentialSuccess(null);
                setActiveModal("credentials");
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-[#F5F3F0] transition-colors group text-left"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644] group-hover:bg-[#191919] group-hover:text-white transition-colors flex-shrink-0">
                  <KeyRound className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="font-sans text-[14px] text-[#191919] font-medium block">
                    Login &amp; Security
                  </span>
                  <span className="font-sans text-[12px] text-[#77716D] block truncate">
                    Edit Name, Email &amp; Password
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

        {/* Mobile: Privacy & Device Security Section */}
        <section className="mb-5">
          <span className="font-sans text-[10px] uppercase text-[#77716D] tracking-[0.2em] font-semibold block mb-2 px-1">
            PRIVACY &amp; DEVICE SECURITY
          </span>
          <div className="bg-white rounded-xl shadow-xs border border-[#EAE5DF]/70 p-4 space-y-3">
            <p className="text-xs text-[#77716D]">
              Clears locally cached autofill data (saved addresses, name, phone, measurements) from this browser. Authoritative records remain secure in your cloud profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearLocalData}
                className="w-full py-2.5 px-3 border border-[#EAE5DF] text-[#191919] hover:bg-[#F5F3F0] text-[10px] uppercase tracking-wider font-semibold transition-colors"
              >
                {localDataCleared ? "Device Data Cleared ✓" : "Clear Device Cache"}
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => setActiveModal("deleteAccount")}
                  className="w-full py-2.5 px-3 border border-rose-200 bg-rose-50/50 text-rose-800 hover:bg-rose-100 text-[10px] uppercase tracking-wider font-semibold transition-colors"
                >
                  Delete Account &amp; Data
                </button>
              )}
            </div>
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
                href="https://wa.me/918123200215?text=Hello%20Neel%27s%20Designer%20Studio"
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
                href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl"
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

      </>)}
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
        {loading ? (
          <div className="grid grid-cols-12 gap-10 mt-8 items-start">
            {/* Sidebar skeleton */}
            <div className="col-span-3 flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            {/* Content skeleton */}
            <div className="col-span-9 flex flex-col gap-6">
              <div className="flex items-center gap-5 pb-6 border-b border-[#EAE5DF]">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-sm" />
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
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
                onClick={() => {
                  setActiveDesktopTab("personal");
                  document.getElementById("personal-info")?.scrollIntoView({ behavior: "smooth" });
                }}
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
                onClick={() => {
                  setActiveDesktopTab("orders");
                  document.getElementById("my-orders")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex items-center justify-between px-5 py-4 text-xs uppercase tracking-widest font-medium transition-colors text-left w-full ${
                  activeDesktopTab === "orders"
                    ? "bg-[#F5F3F0] text-[#191919] border-l-2 border-[#191919]"
                    : "text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0]/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-[18px] h-[18px]" />
                  <span>My Orders</span>
                </div>
                {ordersCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F3F0] text-[#7B5644] font-semibold border border-[#EAE5DF]">
                    {ordersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDesktopTab("addresses");
                  document.getElementById("saved-addresses")?.scrollIntoView({ behavior: "smooth" });
                }}
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
                onClick={() => {
                  setActiveDesktopTab("measurements");
                  document.getElementById("measurements")?.scrollIntoView({ behavior: "smooth" });
                }}
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


          </aside>

          {/* ── Right Content Dossier (col-span-9) ── */}
          <div className="col-span-9 space-y-10">

            {/* SECTION 1: Personal Credentials & Security */}
            <section
              className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs space-y-6"
              id="personal-info"
            >
              <div className="flex items-center justify-between pb-6 border-b border-[#EAE5DF]">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
                    CREDENTIALS &amp; SECURITY
                  </span>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    Account &amp; Security
                  </h2>
                </div>
                {!isEditingCredentials ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCredentialName(displayName);
                      setCredentialEmail(displayEmail);
                      setCredentialNewPassword("");
                      setCredentialConfirmPassword("");
                      setCredentialError(null);
                      setCredentialSuccess(null);
                      setIsEditingCredentials(true);
                    }}
                    className="px-5 py-2 border border-[#191919] text-[#191919] hover:bg-[#191919] hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                  >
                    Edit Credentials
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingCredentials(false);
                      setCredentialError(null);
                      setCredentialSuccess(null);
                    }}
                    className="px-5 py-2 border border-[#EAE5DF] text-[#77716D] hover:text-[#191919] transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {credentialSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{credentialSuccess}</span>
                </div>
              )}

              {credentialError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{credentialError}</span>
                </div>
              )}

              {resetEmailSent && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-medium">Password Reset Dispatched</strong>
                    <span className="text-[11px] text-emerald-700">
                      A secure password reset link has been dispatched to <strong>{credentialEmail || displayEmail}</strong>. Please check your inbox and follow the link to establish your new password.
                    </span>
                  </div>
                </div>
              )}

              {!isEditingCredentials ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
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
                      Password
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-base text-[#191919] font-medium tracking-widest">••••••••••••</p>
                      <button
                        type="button"
                        onClick={handleTriggerPasswordReset}
                        disabled={resetEmailLoading}
                        className="text-[11px] text-[#7B5644] hover:underline font-medium transition-colors ml-2"
                      >
                        {resetEmailLoading ? "Sending..." : "Reset"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCredentials} className="space-y-5 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={credentialName}
                        onChange={(e) => setCredentialName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FDFBF8] border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={credentialEmail}
                        onChange={(e) => setCredentialEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#FDFBF8] border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F5] border border-[#EAE5DF] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-[#191919] block">
                          Change Password
                        </span>
                        <p className="text-[11px] text-[#77716D]">
                          Leave blank if you wish to retain your existing password.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerPasswordReset}
                        disabled={resetEmailLoading}
                        className="text-[11px] text-[#7B5644] hover:underline font-medium uppercase tracking-wider"
                      >
                        {resetEmailLoading ? "Sending Link..." : "Forgot Password?"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={credentialNewPassword}
                          onChange={(e) => setCredentialNewPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1.5">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={credentialConfirmPassword}
                          onChange={(e) => setCredentialConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingCredentials(false);
                        setCredentialError(null);
                        setCredentialSuccess(null);
                      }}
                      className="px-5 py-2.5 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={credentialLoading}
                      className="inline-flex items-center gap-2 px-7 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors disabled:opacity-50"
                    >
                      {credentialLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* SECTION: My Orders & Commissioned Pieces */}
            <section
              className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs space-y-6"
              id="my-orders"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
                    BESPOKE COMMISSIONS &amp; PURCHASES
                  </span>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    My Orders ({userOrders.length})
                  </h2>
                </div>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-[#191919] text-[#191919] hover:bg-[#191919] hover:text-white transition-colors duration-200 text-xs uppercase tracking-widest font-medium self-start sm:self-auto"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Full Order Tracker</span>
                </Link>
              </div>

              {userOrders.length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F3F0] flex items-center justify-center text-[#7B5644]">
                    <Package className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-base text-[#191919]">No Orders Yet</p>
                    <p className="text-xs text-[#77716D] max-w-sm mx-auto">
                      Your commissioned garments and bespoke purchases from Neel&apos;s Designer Studio will appear here with live tailoring progress.
                    </p>
                  </div>
                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#191919] text-white hover:bg-[#7B5644] transition-colors duration-200 text-xs uppercase tracking-widest font-medium"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#EAE5DF]">
                  {userOrders.map((order) => {
                    const formattedDate = order.created_at || order.createdAt || order.date
                      ? new Date(order.created_at || order.createdAt || order.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recently Placed";
                    const isPending = order.status === "Payment Pending";
                    const totalVal = Number(order.total || order.totalAmount || 0);

                    return (
                      <div key={order.id} className="py-6 first:pt-2 last:pb-2 space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-4 border border-[#EAE5DF] rounded-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-[#191919]">{order.id}</span>
                              <span
                                className={`px-2.5 py-0.5 uppercase tracking-wider font-semibold rounded-full text-[10px] ${
                                  isPending
                                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                                    : order.status === "Confirmed"
                                    ? "bg-[#F5EAE1] text-[#7B5644] border border-[#EAE5DF]"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {order.status || "Confirmed"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#77716D]">
                              Placed on {formattedDate} · Payment: {order.payment_method || order.paymentMethod || "Direct UPI"}
                              {order.upi_ref_id || order.utr ? ` (UTR: ${order.upi_ref_id || order.utr})` : ""}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-[10px] uppercase tracking-wider text-[#77716D] block">Total</span>
                              <span className="font-serif text-sm font-semibold text-[#191919]">
                                ₹{totalVal.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <Link
                              href={`/orders?id=${order.id}`}
                              className="px-3.5 py-1.5 bg-white border border-[#EAE5DF] text-[#191919] hover:bg-[#191919] hover:text-white transition-colors text-xs uppercase tracking-wider font-medium"
                            >
                              Track →
                            </Link>
                          </div>
                        </div>

                        {/* Order Items List */}
                        {order.items && order.items.length > 0 && (
                          <div className="space-y-3 pl-1">
                            {order.items.map((item: any, idx: number) => {
                              const title = item.product?.title || item.productTitle || "Bespoke Atelier Garment";
                              const image = item.product?.images?.[0] || item.productImage || "";
                              const size = item.selectedSize || item.size || "";
                              const qty = item.quantity || 1;
                              const price = Number(item.product?.price || item.unitPrice || item.price || 0);

                              return (
                                <div key={idx} className="flex items-center justify-between gap-4 p-3 border border-[#EAE5DF]/60 bg-white">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-18 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden flex-shrink-0">
                                      {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={image} alt={title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#77716D]">
                                          Piece
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-serif text-sm text-[#191919] font-medium truncate">{title}</h4>
                                      <p className="text-xs text-[#77716D] mt-0.5">
                                        {size ? `Size: ${size}` : ""} {qty ? ` · Qty: ${qty}` : ""}
                                      </p>
                                      {item.customMeasurements && (
                                        <p className="text-[10px] text-[#7B5644] mt-0.5">Custom Tailored to Fit</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-right flex-shrink-0">
                                    <span className="font-serif text-sm text-[#191919] font-medium">
                                      ₹{price.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {isPending && (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                            <span>Awaiting UPI verification for this order. Share UTR / screenshot on WhatsApp to expedite:</span>
                            <a
                              href={`https://wa.me/917907823528?text=${encodeURIComponent(
                                `Hello Neel's Designer Studio, I would like to verify payment for Order #${order.id}. Total: ₹${totalVal}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold underline hover:text-amber-950 ml-2 whitespace-nowrap"
                            >
                              Verify on WhatsApp →
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

            {/* SECTION 4: Data Privacy & Security */}
            <section className="border border-[#EAE5DF] bg-white p-6 sm:p-8 rounded-sm shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-[#191919] font-normal">
                    Privacy &amp; Data Rights
                  </h2>
                  <p className="text-xs text-[#77716D] mt-1">
                    Purge locally cached browser autofill data or exercise your statutory data deletion rights.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearLocalData}
                    className="px-4 py-2 border border-[#EAE5DF] text-[#191919] hover:bg-[#F5F3F0] text-xs uppercase tracking-wider font-medium transition-colors"
                  >
                    {localDataCleared ? "Device Cache Cleared ✓" : "Clear Device Cache"}
                  </button>
                  {user && (
                    <button
                      type="button"
                      onClick={() => setActiveModal("deleteAccount")}
                      className="px-4 py-2 border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs uppercase tracking-wider font-semibold transition-colors"
                    >
                      Delete Account &amp; Data
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-[#77716D] pt-4 leading-relaxed">
                Authoritative patron profile and order details are securely managed in protected cloud storage. In accordance with statutory Indian tax and accounting regulations, historical financial invoices and tax registers are legally preserved even upon personal account erasure.
              </p>
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
                  Return &amp; Cancellation Policy
                </button>
              </div>
            </div>

          </div>
        </div>
        )} {/* end loading ternary */}
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

      {/* 1.5 Login Credentials & Security Modal (Name, Email, Password / Reset) */}
      {activeModal === "credentials" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-md w-full p-6 sm:p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
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
              LOGIN &amp; SECURITY
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Edit Account Credentials</h3>

            {credentialSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{credentialSuccess}</span>
              </div>
            )}

            {credentialError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{credentialError}</span>
              </div>
            )}

            {resetEmailSent && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-medium">Reset Link Sent</strong>
                  <span className="text-[11px] text-emerald-700">
                    A secure password reset link has been dispatched to <strong>{credentialEmail || displayEmail}</strong>. Follow the link to create your new password.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={credentialName}
                  onChange={(e) => setCredentialName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={credentialEmail}
                  onChange={(e) => setCredentialEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                />
              </div>

              <div className="p-3.5 bg-[#F9F8F5] border border-[#EAE5DF] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#191919] block">
                      Change Password
                    </span>
                    <span className="text-[10px] text-[#77716D]">
                      Leave empty to keep existing password
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerPasswordReset}
                    disabled={resetEmailLoading}
                    className="text-[10px] text-[#7B5644] hover:underline font-semibold uppercase tracking-wider"
                  >
                    {resetEmailLoading ? "Sending..." : "Forgot Password?"}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={credentialNewPassword}
                    onChange={(e) => setCredentialNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={credentialConfirmPassword}
                    onChange={(e) => setCredentialConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] text-[#191919]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-xs text-[#77716D] hover:text-[#191919] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credentialLoading}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs font-semibold uppercase tracking-widest hover:bg-[#7B5644] transition-colors disabled:opacity-50"
                >
                  {credentialLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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
                    value={addressFormData.pincode}
                    onChange={(e) => {
                      const cleanPin = e.target.value.replace(/\D/g, "").slice(0, 6);
                      const autoState = cleanPin.length >= 2 ? detectStateFromPincode(cleanPin) : null;
                      setAddressFormData((prev) => ({
                        ...prev,
                        pincode: cleanPin,
                        state: prev.state && prev.state !== "India" ? prev.state : (autoState || prev.state),
                      }));
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  State
                </label>
                <select
                  value={addressFormData.state}
                  onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EAE5DF] focus:outline-none focus:border-[#191919] cursor-pointer"
                >
                  <option value="">Select State / Territory</option>
                  {INDIAN_STATES_LIST.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#77716D] uppercase tracking-wider font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
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
                Prices listed in INR are direct atelier pricing. Orders commence once payment and sizing details are confirmed.
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
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
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
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Privacy &amp; Data Policy</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <p>
                <strong>Information We Collect:</strong> To tailor bespoke garments and fulfill couture commissions, Neel&apos;s Designer Studio collects your full name, email address, mobile number, delivery address, city, state, PIN code, tailored measurements, and commission history.
              </p>
              <p>
                <strong>Payment Security &amp; No-COD Policy:</strong> We process orders via direct UPI transfer (Cash on Delivery is unavailable due to custom bespoke cutting). We never solicit, process, or store credit/debit card numbers or net banking credentials. Orders remain in <em>Payment Pending</em> until verified by our accounts desk.
              </p>
              <p>
                <strong>Data Retention &amp; Rights:</strong> You may request complete erasure of your patron profile, addresses, bag, and wishlist at any time. In accordance with statutory Indian commercial regulations, historical order ledgers are retained for mandatory regulatory audit periods.
              </p>
              <p>
                <strong>Verified Contact:</strong> Email: <a href="mailto:neels9589@gmail.com" className="text-[#191919] underline">neels9589@gmail.com</a> · Primary/WhatsApp: <a href="tel:+918123200215" className="text-[#191919] underline">+91 8123200215</a> · Secondary: +91 9740259215.
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

      {/* 6. Customer Care: Return & Cancellation Policy Modal */}
      {activeModal === "returns" && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-lg w-full p-6 sm:p-8 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
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
              ATELIER POLICIES
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-4">Order Cancellation &amp; Refund Policy</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <div className="p-3 bg-[#F5F3F0] border border-[#EAE5DF] text-[#191919] space-y-1">
                <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                  Order Cancellation
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#77716D]">
                  <li>Customers who wish to cancel an order must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                  <li>Cancellation requests must be submitted within 24 hours of placing the order.</li>
                  <li>Approved cancellations within this period are eligible for a full refund, including shipping charges paid.</li>
                  <li>Requests submitted after 24 hours may not be accepted, particularly if the order has already been processed or dispatched.</li>
                  <li>Cancellation is subject to confirmation by the shop owner.</li>
                </ul>
              </div>

              <div className="p-3 bg-[#F5F3F0] border border-[#EAE5DF] text-[#191919] space-y-1">
                <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                  Refund Policy
                </strong>
                <ul className="list-disc pl-4 space-y-1 text-xs text-[#77716D]">
                  <li>For refund-related enquiries, customers must contact Neel&apos;s Designer Studio directly through WhatsApp or Instagram.</li>
                  <li>Approved cancellations within 24 hours qualify for a 100% refund, including shipping charges.</li>
                  <li>Refund requests relating to damaged, defective, or incorrect products will be reviewed individually.</li>
                  <li>Refund eligibility is subject to the applicable exchange and cancellation conditions.</li>
                  <li>Once approved, refunds will be arranged through the applicable payment method.</li>
                  <li>Processing time may depend on the payment provider or financial institution.</li>
                </ul>
              </div>

              <div className="p-3 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] space-y-1">
                <strong className="block text-[11px] uppercase tracking-wider text-[#7B5644]">
                  Contact for Cancellation and Refunds:
                </strong>
                <p>WhatsApp: <a href="https://wa.me/918123200215" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">+91 8123200215</a></p>
                <p>Instagram: <a href="https://www.instagram.com/neels_designer_studio?obrf=aDk1emZ3aHVicDZl" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7B5644]">Neel&apos;s Designer Studio official Instagram account</a></p>
                <p>Email: <a href="mailto:neels9589@gmail.com" className="underline hover:text-[#7B5644]">neels9589@gmail.com</a></p>
                <p className="text-[11px] text-[#77716D] pt-0.5">Please provide your order ID and registered contact number when contacting us.</p>
              </div>
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

      {/* 7. Delete Account & Personal Data Modal */}
      {activeModal === "deleteAccount" && (
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
            <span className="text-[10px] uppercase tracking-[0.2em] text-rose-700 font-semibold block mb-1">
              DATA PRIVACY &amp; ERASURE
            </span>
            <h3 className="font-serif text-2xl text-[#191919] mb-3">Delete Account &amp; Personal Data</h3>
            <div className="space-y-3 text-xs text-[#77716D] leading-relaxed">
              <p>
                Requesting erasure will permanently delete your patron profile, saved addresses, measurements, bag, wishlist, and Supabase login identity from our system.
              </p>
              <p className="bg-amber-50 p-3 border border-amber-200 text-amber-950">
                <strong>Statutory Retention Notice:</strong> In compliance with Indian statutory regulations, past order records are retained with your patron profile disassociated for mandatory compliance.
              </p>
              {deleteAccountError && (
                <p className="p-2 bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                  {deleteAccountError}
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-[#EAE5DF] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                disabled={isDeletingAccount}
                className="px-4 py-2 border border-[#EAE5DF] text-[#191919] text-xs font-semibold uppercase tracking-wider hover:bg-[#F5F3F0]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-5 py-2 bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider hover:bg-rose-800 disabled:opacity-50"
              >
                {isDeletingAccount ? "Deleting..." : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
