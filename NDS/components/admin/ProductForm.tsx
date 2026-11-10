"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/products-data";
import { saveProductToStorage } from "@/lib/products-store";
import { useLiveCategories } from "@/lib/categories-store";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FolderOpen,
  UploadCloud,
  Loader2,
} from "lucide-react";

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const CLOTHING_CATEGORIES = [
  { label: "Korean", value: "korean" },
  { label: "Short Kurti", value: "short-kurti" },
  { label: "Pakistani", value: "pakistani" },
  { label: "Lehenga", value: "lehenga" },
  { label: "Gown", value: "gown" },
  { label: "Party Wear", value: "party-wear" },
  { label: "Co-ord Set", value: "co-ord-set" },
  { label: "Jeans", value: "jeans" },
];

const ACCESSORY_CATEGORIES = [
  { label: "Bracelet & Cuffs", value: "bracelets" },
  { label: "Clutches & Potlis", value: "clutches" },
  { label: "Statement Rings", value: "rings" },
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const { categories: allLiveCategories, clothing: liveClothing, accessories: liveAccessories } = useLiveCategories();

  // Determine initial product type
  const initialIsAccessory = initialData?.isAccessory ?? (
    initialData?.category ? ["bracelets", "clutches", "rings"].includes(initialData.category) : false
  );

  const [productType, setProductType] = useState<"clothing" | "accessory">(
    initialIsAccessory ? "accessory" : "clothing"
  );

  // Form fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState<Product["category"]>(
    initialData?.category || (initialIsAccessory ? "bracelets" : "lehenga")
  );
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ? String(initialData.originalPrice) : ""
  );
  const [description, setDescription] = useState(initialData?.description || "");

  // Images: main + additional
  const [mainImage, setMainImage] = useState(initialData?.images?.[0] || "");
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    initialData?.images?.slice(1) || []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Clothing-specific fields
  const [sizes, setSizes] = useState<string[]>(
    initialData?.sizes || ["XS", "S", "M", "L", "XL"]
  );
  const [fabric, setFabric] = useState(initialData?.fabric || "");
  const [careInstructions, setCareInstructions] = useState(initialData?.washCare || "");
  const [deliveryTimeline, setDeliveryTimeline] = useState(initialData?.deliveryTime || "");

  // Accessory-specific fields
  const [ringSize, setRingSize] = useState(
    initialData?.sizes?.[0] || "Adjustable Atelier Band (Free Size)"
  );
  const [metalBase, setMetalBase] = useState(initialData?.fabric || "");
  const [gemstoneCraft, setGemstoneCraft] = useState(initialData?.embroidery || "");

  // Status & Badges
  const [inStock, setInStock] = useState(initialData?.inStock !== false);
  const [newArrival, setNewArrival] = useState(Boolean(initialData?.newArrival));

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTypeChange = (type: "clothing" | "accessory") => {
    setProductType(type);
    if (type === "clothing") {
      setCategory("lehenga");
    } else {
      setCategory("bracelets");
    }
  };

  const handleSizeToggle = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const [mainUploading, setMainUploading] = useState(false);
  const [additionalUploading, setAdditionalUploading] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // File upload helper
  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn("Upload API error, falling back to data URL:", e);
    }

    // Fallback: Read as base64 data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMainUploading(true);
    try {
      const url = await uploadFile(file);
      setMainImage(url);
    } finally {
      setMainUploading(false);
      e.target.value = "";
    }
  };

  const handleAdditionalFilesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setAdditionalUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      }
      setAdditionalImages((prev) => [...prev, ...newUrls]);
    } finally {
      setAdditionalUploading(false);
      e.target.value = "";
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setAdditionalImages([...additionalImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please provide a product title.");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg("Please provide a valid selling price.");
      return;
    }

    if (!mainImage.trim()) {
      setErrorMsg("Main product image URL is required.");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("Please provide a short description.");
      return;
    }

    if (productType === "clothing" && sizes.length === 0) {
      setErrorMsg("Please select at least one available size for this garment.");
      return;
    }

    setSubmitting(true);

    const isAccessory = productType === "accessory";
    const allImages = [mainImage.trim(), ...additionalImages.filter(Boolean)];

    const productPayload: Product = {
      id: initialData?.id || `prod-custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug:
        initialData?.slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      title: title.trim(),
      category: category as any,
      categoryLabel: isAccessory
        ? "Accessories"
        : category.charAt(0).toUpperCase() + category.slice(1).replace("-", " "),
      subCategory: subCategory.trim() || (isAccessory ? "Haute Joaillerie" : "Atelier Couture"),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      images: allImages,
      description: description.trim(),
      details: [
        isAccessory
          ? `Precious Base: ${metalBase || "22k Gold Foil on Silver"}`
          : `Primary Fabric: ${fabric || "Pure Handloom Silk"}`,
        isAccessory
          ? `Craft: ${gemstoneCraft || "Hand Jadau & Micro Seed Pearl"}`
          : "Hand-finished scallop embroidery with delicate detailing",
        "Signature atelier archival packaging included",
      ],
      fabric: isAccessory
        ? metalBase.trim() || "22k Gold Foil on Sterling Silver"
        : fabric.trim() || "100% Pure Mulberry Silk",
      embroidery: isAccessory
        ? gemstoneCraft.trim() || "Hand-set Uncut Polki & Enamel"
        : "Delicate Needlework & Zari",
      washCare: careInstructions.trim() || (
        isAccessory
          ? "Store in velvet case away from humidity & perfumes."
          : "Specialist Dry Clean Only. Store in breathable muslin bag."
      ),
      deliveryTime: deliveryTimeline.trim() || "Ships within 3-5 business days via Insured Express",
      sizes: isAccessory
        ? [category === "rings" ? ringSize : "Standard One Size"]
        : sizes,
      inStock,
      newArrival,
      isAccessory,
    };

    try {
      // 1. Save to client storage (instant storefront access)
      saveProductToStorage(productPayload);

      // 2. Persist to server API
      const endpoint = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.warn("Server save notice:", err.error);
      }

      router.push("/admin/products");
    } catch (err: any) {
      console.error("Save error:", err);
      // Still redirect if saved locally
      router.push("/admin/products");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">

      {/* ── Form Top Navigation ── */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EAE5DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 text-[#77716D] hover:text-[#191919] hover:bg-[#F5F3F0] transition-colors rounded-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-0.5">
              CATALOG MANAGEMENT
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal">
              {isEdit ? "Edit Product Dossier" : "Add New Atelier Creation"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? "Saving..." : isEdit ? "Save Changes" : "Publish Product"}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── SECTION 1: Product Classification ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="font-serif text-lg text-[#191919] font-normal border-b border-[#EAE5DF] pb-3">
          1. Classification &amp; Category
        </h2>

        {/* Product Type Toggle: Clothing vs Accessory */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
            Product Type *
          </label>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            <button
              type="button"
              onClick={() => handleTypeChange("clothing")}
              className={`p-4 border text-left transition-all ${
                productType === "clothing"
                  ? "border-[#191919] bg-[#F5F3F0] ring-1 ring-[#191919]"
                  : "border-[#EAE5DF] hover:border-[#191919]/40 bg-white"
              }`}
            >
              <div className="font-serif text-sm font-semibold text-[#191919]">
                Clothing
              </div>
              <p className="text-[11px] text-[#77716D] mt-0.5">
                Lehengas, Gowns, Pakistani Suits, Kurtis, etc.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("accessory")}
              className={`p-4 border text-left transition-all ${
                productType === "accessory"
                  ? "border-[#191919] bg-[#F5F3F0] ring-1 ring-[#191919]"
                  : "border-[#EAE5DF] hover:border-[#191919]/40 bg-white"
              }`}
            >
              <div className="font-serif text-sm font-semibold text-[#191919]">
                Accessory
              </div>
              <p className="text-[11px] text-[#77716D] mt-0.5">
                Bracelets, Clutches, and Statement Rings.
              </p>
            </button>
          </div>
        </div>

        {/* Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:max-w-md">
            <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold">
              Boutique Category *
            </label>
            <Link
              href="/admin/categories"
              target="_blank"
              className="text-[10px] uppercase tracking-wider text-[#7B5644] hover:text-[#191919] font-semibold transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Manage Categories</span>
            </Link>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full sm:max-w-md bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
          >
            {productType === "clothing"
              ? liveClothing.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} Collection
                  </option>
                ))
              : liveAccessories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
          </select>
        </div>

        {/* Subcategory / Editorial Label */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
            Sub-Category / Eyebrow Label (Optional)
          </label>
          <input
            type="text"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            placeholder={
              productType === "clothing"
                ? "e.g. Silk Separates, Bridal Edit, Evening Couture"
                : "e.g. Haute Joaillerie, Heritage Potlis"
            }
            className="w-full sm:max-w-md bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
          />
        </div>
      </div>

      {/* ── SECTION 2: Basic Information & Pricing ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="font-serif text-lg text-[#191919] font-normal border-b border-[#EAE5DF] pb-3">
          2. Product Details &amp; Pricing
        </h2>

        {/* Product Title */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
            Product Title / Name *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Zari Embroidered Azure Silk Kurti"
            className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
          />
        </div>

        {/* Pricing Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 48000"
              className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
              Original / MRP Price (₹) (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="e.g. 54000 (strike-through discount)"
              className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
            Short Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Concise, 2-3 sentence summary displayed on the Product Details Page..."
            className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] leading-relaxed focus:outline-none focus:border-[#7B5644]"
          />
        </div>
      </div>

      {/* ── SECTION 3: Imagery ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-[#EAE5DF] pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h2 className="font-serif text-lg text-[#191919] font-normal">
            3. Imagery (Upload from Device or Paste URL)
          </h2>
          <span className="text-[11px] text-[#77716D]">
            Supports local files (.jpg, .png, .webp) & web URLs
          </span>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleMainFileSelect}
          className="hidden"
        />
        <input
          ref={additionalFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalFilesSelect}
          className="hidden"
        />

        {/* Main Product Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold">
              Main Primary Image * (Portrait 4:5 Recommended)
            </label>
            {mainUploading && (
              <span className="text-xs text-[#7B5644] flex items-center gap-1.5 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading image...
              </span>
            )}
          </div>

          {/* Upload / URL Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
            {/* File explorer button */}
            <button
              type="button"
              disabled={mainUploading}
              onClick={() => mainFileInputRef.current?.click()}
              className="sm:col-span-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse from Device</span>
            </button>

            {/* Direct URL input */}
            <div className="sm:col-span-7 flex items-center">
              <input
                type="text"
                required
                value={mainImage}
                onChange={(e) => setMainImage(e.target.value)}
                placeholder="Or paste image URL (e.g. /images/... or https://...)"
                className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
              />
            </div>
          </div>

          {/* Main image preview */}
          {mainImage && (
            <div className="mt-2 p-3 bg-[#FBF9F6] border border-[#EAE5DF] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-20 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden aspect-[4/5] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImage}
                    alt="Main Preview"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://placehold.co/400x500/EFEEEB/77716D?text=Invalid+Image";
                    }}
                  />
                </div>
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-medium text-[#191919] truncate max-w-[220px] sm:max-w-md">
                    {mainImage}
                  </p>
                  <p className="text-[11px] text-[#77716D] mt-0.5">
                    Primary portrait cover shown on collection cards & product details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMainImage("")}
                className="p-2 text-[#77716D] hover:text-[#B91C1C] transition-colors shrink-0"
                title="Remove main image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Additional Images (Optional) */}
        <div className="space-y-3 pt-4 border-t border-[#EAE5DF]">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold">
              Additional Gallery Images (Optional angles, craftsmanship details)
            </label>
            {additionalUploading && (
              <span className="text-xs text-[#7B5644] flex items-center gap-1.5 font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading files...
              </span>
            )}
          </div>

          {/* List of current additional images */}
          {additionalImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              {additionalImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group w-16 h-20 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden aspect-[4/5]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Angle ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 font-mono">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add additional image controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
            {/* Browse multiple from device */}
            <button
              type="button"
              disabled={additionalUploading}
              onClick={() => additionalFileInputRef.current?.click()}
              className="sm:col-span-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5F3F0] hover:bg-[#EAE8E5] text-[#191919] text-xs font-semibold uppercase tracking-wider border border-[#EAE5DF] transition-colors disabled:opacity-50"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Browse Multiple from Device</span>
            </button>

            {/* Direct URL input + Add button */}
            <div className="sm:col-span-7 flex gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
                placeholder="Or paste additional URL and click Add"
                className="flex-1 bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Category-Specific Sizing & Specs ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="font-serif text-lg text-[#191919] font-normal border-b border-[#EAE5DF] pb-3">
          4. {productType === "clothing" ? "Garment Sizing & Fabric" : "Jewelry Fitting & Specifications"}
        </h2>

        {/* ── IF CLOTHING: Available sizes + Fabric ── */}
        {productType === "clothing" ? (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                Available Sizes * (Select all that apply)
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {CLOTHING_SIZES.map((size) => {
                  const selected = sizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeToggle(size)}
                      className={`w-12 h-11 flex items-center justify-center text-xs uppercase font-semibold transition-all border ${
                        selected
                          ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                          : "bg-[#F5F3F0] text-[#191919] border-[#EAE5DF] hover:border-[#191919]/40"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Primary Textile / Fabric (Optional)
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Chanderi Silk with Mul Lining"
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Care Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="e.g. Specialist Dry Clean Only"
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>
            </div>
          </div>
        ) : (
          /* ── IF ACCESSORY: No Clothing Sizes ── */
          <div className="space-y-6">
            {category === "rings" ? (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Ring Size / Band Fitting
                </label>
                <select
                  value={ringSize}
                  onChange={(e) => setRingSize(e.target.value)}
                  className="w-full sm:max-w-md bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                >
                  <option value="Adjustable Atelier Band (Free Size)">
                    Adjustable Atelier Band (Free Size)
                  </option>
                  <option value="Standard Ring Size 12-14">Standard Ring Size 12-14</option>
                  <option value="Standard Ring Size 15-17">Standard Ring Size 15-17</option>
                  <option value="Custom Atelier Ring Sizing">Custom Atelier Ring Sizing</option>
                </select>
              </div>
            ) : (
              <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] text-xs text-[#77716D]">
                <strong className="text-[#191919] block mb-1">
                  Accessory Sizing Specification
                </strong>
                {category === "bracelets"
                  ? "Standard atelier wrist cuff fit (2.4 - 2.6 inches) is applied automatically."
                  : "Standard atelier clutch dimensions (One Size) are applied automatically."}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Base Metal / Precious Foundation (Optional)
                </label>
                <input
                  type="text"
                  value={metalBase}
                  onChange={(e) => setMetalBase(e.target.value)}
                  placeholder="e.g. 22k Gold Foil on Sterling Silver"
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Gemstone &amp; Craft Artistry (Optional)
                </label>
                <input
                  type="text"
                  value={gemstoneCraft}
                  onChange={(e) => setGemstoneCraft(e.target.value)}
                  placeholder="e.g. Uncut Polki Diamonds &amp; Meenakari Enamel"
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Delivery timeline (common) */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
            Delivery Timeline (Optional)
          </label>
          <input
            type="text"
            value={deliveryTimeline}
            onChange={(e) => setDeliveryTimeline(e.target.value)}
            placeholder="e.g. Ships within 3-5 business days via Insured Express"
            className="w-full sm:max-w-md bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
          />
        </div>
      </div>

      {/* ── SECTION 5: Inventory & Storefront Badges ── */}
      <div className="bg-[#FFFFFF] border border-[#EAE5DF] p-6 sm:p-8 space-y-4 shadow-xs">
        <h2 className="font-serif text-lg text-[#191919] font-normal border-b border-[#EAE5DF] pb-3">
          5. Availability &amp; Display Options
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 pt-2">
          {/* In Stock Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-4 h-4 accent-[#191919]"
            />
            <div>
              <span className="text-xs font-semibold text-[#191919] block">
                Product Available (In Stock)
              </span>
              <span className="text-[11px] text-[#77716D]">
                Allow customers to add this creation to their shopping bag.
              </span>
            </div>
          </label>

          {/* New Arrival Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newArrival}
              onChange={(e) => setNewArrival(e.target.checked)}
              className="w-4 h-4 accent-[#191919]"
            />
            <div>
              <span className="text-xs font-semibold text-[#191919] block">
                Feature as &quot;New Arrival&quot;
              </span>
              <span className="text-[11px] text-[#77716D]">
                Display New Arrival badge and show in homepage showcase row.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* ── Bottom Submit Bar ── */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/admin/products"
          className="px-5 py-2.5 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] font-semibold transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? "Saving..." : isEdit ? "Save Changes" : "Publish Product"}</span>
        </button>
      </div>

    </form>
  );
}
