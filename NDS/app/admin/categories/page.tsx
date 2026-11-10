"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  FolderPlus,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Shirt,
  Search,
  AlertCircle,
  X,
  Loader2,
  Check,
  ImageIcon,
  UploadCloud,
  Upload,
} from "lucide-react";
import { useLiveCategories, saveCategoryToStorage, deleteCategoryFromStorage } from "@/lib/categories-store";
import { AtelierCategory } from "@/lib/products-data";

export default function AdminCategoriesPage() {
  const { categories, clothing, accessories, refresh } = useLiveCategories();
  const [activeTab, setActiveTab] = useState<"clothing" | "accessory">("clothing");
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<"clothing" | "accessory">("clothing");
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<AtelierCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-slugify as name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormSlug(slug);
  };

  // Upload helper for category image from file explorer
  const uploadCategoryFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFormError("Only image files (JPG, PNG, WebP) are allowed.");
      return;
    }

    setIsUploadingImage(true);
    setFormError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormImage(data.url);
          setIsUploadingImage(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Upload API error, falling back to local file reader:", err);
    }

    // Fallback: Read as base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImage(reader.result as string);
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCategoryFile(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadCategoryFile(file);
    }
  };

  const handleOpenModal = (defaultType?: "clothing" | "accessory") => {
    setFormType(defaultType || activeTab);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormImage("");
    setFormError("");
    setUploadMode("file");
    setIsUploadingImage(false);
    setIsDragOver(false);
    setIsModalOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        type: formType,
        description: formDescription.trim(),
        image: formImage.trim() || undefined,
      };

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create category");
      }

      const data = await res.json();
      if (data.category) {
        saveCategoryToStorage(data.category);
      }

      await refresh();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);

    try {
      // 1. Delete on server
      await fetch(`/api/admin/categories?id=${encodeURIComponent(categoryToDelete.id)}&slug=${encodeURIComponent(categoryToDelete.slug)}`, {
        method: "DELETE",
      });

      // 2. Remove from local store
      deleteCategoryFromStorage(categoryToDelete.id);
      await refresh();
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter categories for the active tab and search query
  const displayedCategories = (activeTab === "clothing" ? clothing : accessories).filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Top Header & Add Category CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
            ATELIER TAXONOMY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal tracking-tight">
            Categories &amp; Collections
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
            Create, manage, and curate separate category discovery edits for Clothing and Accessories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* ── Tab Switcher & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 border border-[#EAE5DF]">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F3F0] rounded-xs border border-[#EAE5DF]">
          <button
            type="button"
            onClick={() => setActiveTab("clothing")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "clothing"
                ? "bg-[#191919] text-[#FDFBF8] shadow-xs"
                : "text-[#77716D] hover:text-[#191919]"
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Clothing</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === "clothing" ? "bg-white/20 text-white" : "bg-black/10 text-[#77716D]"
            }`}>
              {clothing.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("accessory")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "accessory"
                ? "bg-[#191919] text-[#FDFBF8] shadow-xs"
                : "text-[#77716D] hover:text-[#191919]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Accessories</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === "accessory" ? "bg-white/20 text-white" : "bg-black/10 text-[#77716D]"
            }`}>
              {accessories.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab === "clothing" ? "clothing" : "accessory"} categories...`}
            className="w-full pl-9 pr-3 py-2 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] placeholder:text-[#77716D] focus:outline-none focus:border-[#7B5644]"
          />
        </div>
      </div>

      {/* ── Categories Grid ── */}
      {displayedCategories.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#EAE5DF] rounded-xs">
          <FolderPlus className="w-8 h-8 text-[#77716D] mx-auto mb-3 stroke-[1.5]" />
          <h3 className="font-serif text-lg text-[#191919] mb-1">No Categories Found</h3>
          <p className="text-xs text-[#77716D] max-w-sm mx-auto mb-4">
            {searchQuery
              ? "No categories matched your search criteria."
              : `Create your first custom ${activeTab === "clothing" ? "clothing" : "accessory"} category.`}
          </p>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-wider font-semibold hover:bg-[#7B5644] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {displayedCategories.map((category) => {
            const previewUrl =
              category.type === "clothing"
                ? `/categories/${category.slug}`
                : `/accessories/${category.slug}`;

            return (
              <div
                key={category.id}
                className="group flex flex-col bg-white border border-[#EAE5DF] overflow-hidden hover:border-[#191919]/40 hover:shadow-sm transition-all"
              >
                {/* Visual Cover Photo - 4:5 Portrait Ratio matching storefront */}
                <div className="relative aspect-[4/5] w-full bg-[#F5F3F0] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-black/75 backdrop-blur-xs text-[9px] font-semibold uppercase tracking-wider text-white">
                      {category.type}
                    </span>
                    {category.isCustom && (
                      <span className="px-2 py-0.5 bg-[#C9A96E] text-[9px] font-semibold uppercase tracking-wider text-[#191919]">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[10px] font-medium text-[#191919] shadow-xs">
                    {category.count ?? 0} {category.count === 1 ? "Product" : "Products"}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-base text-[#191919] font-medium group-hover:text-[#7B5644] transition-colors">
                        {category.name}
                      </h3>
                      <Link
                        href={previewUrl}
                        target="_blank"
                        className="text-[#77716D] hover:text-[#191919] p-1 transition-colors"
                        title="View Collection on Storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="font-mono text-[11px] text-[#7B5644] mt-0.5">
                      /{category.slug}
                    </div>

                    <p className="text-xs text-[#77716D] mt-2 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-[#EAE5DF] flex items-center justify-between text-xs">
                    <Link
                      href={previewUrl}
                      target="_blank"
                      className="text-[11px] uppercase tracking-wider text-[#191919] font-semibold hover:text-[#7B5644] transition-colors flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {category.isCustom ? (
                      <button
                        type="button"
                        onClick={() => setCategoryToDelete(category)}
                        className="text-[11px] uppercase tracking-wider text-red-600 hover:text-red-800 font-semibold transition-colors flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-[#9E9893] italic">
                        Built-in
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE CATEGORY MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-[#EAE5DF] shadow-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DF] mb-5">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-0.5">
                  NEW TAXONOMY
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-[#191919] font-normal">
                  Create New Category
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#77716D] hover:text-[#191919] p-1.5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-2">
                  Category Department *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType("clothing")}
                    className={`p-3 text-left border transition-all flex items-center gap-3 ${
                      formType === "clothing"
                        ? "border-[#191919] bg-[#F5F3F0] ring-1 ring-[#191919]"
                        : "border-[#EAE5DF] hover:border-[#191919]/40 bg-white"
                    }`}
                  >
                    <Shirt className={`w-5 h-5 ${formType === "clothing" ? "text-[#191919]" : "text-[#77716D]"}`} />
                    <div>
                      <div className="font-serif text-sm font-semibold text-[#191919]">
                        Clothing
                      </div>
                      <p className="text-[10px] text-[#77716D]">
                        Dresses, Kurtis, Lehengas
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("accessory")}
                    className={`p-3 text-left border transition-all flex items-center gap-3 ${
                      formType === "accessory"
                        ? "border-[#191919] bg-[#F5F3F0] ring-1 ring-[#191919]"
                        : "border-[#EAE5DF] hover:border-[#191919]/40 bg-white"
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${formType === "accessory" ? "text-[#191919]" : "text-[#77716D]"}`} />
                    <div>
                      <div className="font-serif text-sm font-semibold text-[#191919]">
                        Accessory
                      </div>
                      <p className="text-[10px] text-[#77716D]">
                        Bangles, Clutches, Jewels
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={handleNameChange}
                  placeholder={formType === "clothing" ? "e.g. Banarasi Heritage, Evening Capes" : "e.g. Regal Brooches, Hair Ornaments"}
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2.5 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2 text-xs text-[#77716D]">
                  <span className="select-none font-mono text-[11px] text-[#9E9893]">
                    {formType === "clothing" ? "/categories/" : "/accessories/"}
                  </span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                    placeholder="banarasi-heritage"
                    className="flex-1 bg-transparent border-0 p-0 text-xs text-[#191919] font-mono focus:outline-none ml-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Artisanal silhouettes embellished with intricate handcrafted embroidery..."
                  className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              {/* Category Cover Image (File Explorer Upload + URL Option) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase tracking-wider text-[#191919] font-semibold">
                    Cover Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadMode(uploadMode === "file" ? "url" : "file")}
                    className="text-[10px] text-[#7B5644] hover:underline font-medium"
                  >
                    {uploadMode === "file" ? "Or enter URL manually" : "Or upload from file explorer"}
                  </button>
                </div>

                {/* Hidden native file input for file explorer */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {formImage ? (
                  /* Live 4:5 Aspect Ratio Preview Card (matching kurti & bracelet presentation) */
                  <div className="border border-[#EAE5DF] bg-[#FAF8F5] p-3 flex items-center gap-4">
                    <div className="relative aspect-[4/5] w-20 bg-[#F5F3F0] border border-[#EAE5DF] overflow-hidden shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formImage}
                        alt="Category Preview"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-medium mb-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Cover Image Attached</span>
                      </div>
                      <p className="text-[11px] text-[#77716D] truncate mb-2.5 font-mono">
                        {formImage.startsWith("data:") ? "Local File Explorer Image" : formImage}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1.5 bg-[#191919] text-[#FDFBF8] hover:bg-[#7B5644] transition-colors"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Change File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormImage("")}
                          className="text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1.5 border border-[#EAE5DF] text-[#77716D] hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : uploadMode === "file" ? (
                  /* File Explorer Upload Dropzone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragOver
                        ? "border-[#7B5644] bg-[#7B5644]/5"
                        : "border-[#D5CEC7] hover:border-[#7B5644] bg-[#FAF8F5] hover:bg-[#F5F2EE]"
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center py-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[#7B5644] mb-2" />
                        <span className="text-xs font-medium text-[#191919]">
                          Uploading image...
                        </span>
                        <span className="text-[10px] text-[#77716D]">
                          Processing file for atelier gallery
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white border border-[#EAE5DF] flex items-center justify-center text-[#7B5644] shadow-xs">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-[#191919] underline decoration-[#7B5644]/60 underline-offset-2">
                            Choose Image from File Explorer
                          </span>
                          <p className="text-[11px] text-[#77716D] mt-0.5">
                            or drag and drop your image file here
                          </p>
                        </div>
                        <span className="text-[10px] text-[#9E9893] uppercase tracking-wider">
                          JPEG, PNG, WebP (4:5 portrait structure recommended)
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  /* Direct URL option */
                  <div>
                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://example.com/cover-image.jpg"
                      className="w-full bg-[#F5F3F0] border border-[#EAE5DF] px-3.5 py-2 text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                    />
                    <p className="text-[10px] text-[#77716D] mt-1">
                      Direct public image link
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EAE5DF] p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg text-[#191919]">
                  Delete Category?
                </h3>
                <p className="text-xs text-[#77716D] mt-1 leading-relaxed">
                  Are you sure you want to remove{" "}
                  <strong className="text-[#191919]">{categoryToDelete.name}</strong>?
                  Products belonging to this category will remain in the catalog.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white text-xs uppercase tracking-wider font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

