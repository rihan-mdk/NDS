"use client";

import React, { useState } from "react";
import { Star, Upload, X, CheckCircle2, Image as ImageIcon, Loader2 } from "lucide-react";
import { ProductReview } from "@/lib/reviews-data";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  product: {
    id: string;
    slug: string;
    title: string;
    image?: string;
    selectedSize?: string;
  };
  customerName?: string;
  customerEmail?: string;
  userId?: string;
  onSuccess?: (review: ProductReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  5: "Exceptional — True Imperial Masterpiece",
  4: "Very Good — Exquisite Craftsmanship",
  3: "Good — Quality Handloom Craft",
  2: "Fair — Acceptable Fit & Finish",
  1: "Needs Improvement — Disappointing",
};

export function ReviewModal({
  isOpen,
  onClose,
  orderId,
  product,
  customerName = "",
  customerEmail = "",
  userId,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState(customerName || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Photo size must be under 5MB.");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!comment.trim()) {
      setErrorMessage("Please share a brief note about your experience with this piece.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | null = null;

      // 1. Upload photo if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Failed to upload photo");
        }

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      // 2. Submit review payload
      const reviewPayload = {
        productId: product.id,
        productSlug: product.slug,
        orderId,
        userId,
        userName: name.trim() || customerName || "Verified Atelier Patron",
        userEmail: customerEmail,
        rating,
        comment: comment.trim(),
        imageUrl: uploadedImageUrl,
      };

      const reviewRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload),
      });

      if (!reviewRes.ok) {
        const errData = await reviewRes.json();
        throw new Error(errData.error || "Failed to submit review");
      }

      const resData = await reviewRes.json();
      const savedReview: ProductReview = resData.review;

      // Also persist to localStorage for instant client synchronization
      try {
        const local = JSON.parse(localStorage.getItem("nds_product_reviews") || "[]");
        local.unshift(savedReview);
        localStorage.setItem("nds_product_reviews", JSON.stringify(local));
        window.dispatchEvent(new Event("nds_reviews_updated"));
      } catch {}

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(savedReview);
      }

      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 1800);
    } catch (err: any) {
      console.error("Submit review error:", err);
      setErrorMessage(err.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#FDFBF8] border border-[#EAE5DF] shadow-2xl p-5 sm:p-8 my-auto max-h-[92vh] overflow-y-auto text-[#191919] animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-[#77716D] hover:text-[#191919] transition-colors"
          aria-label="Close review modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-[#191919] mb-2">Thank You For Your Review</h3>
            <p className="font-sans text-xs text-[#77716D] max-w-xs leading-relaxed">
              Your patron testimonial and real photograph are now live on the atelier collection page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
                VERIFIED PATRON TESTIMONIAL
              </span>
              <h2 className="font-serif text-2xl text-[#191919] font-normal leading-tight">
                Review Your Atelier Creation
              </h2>
            </div>

            {/* Product Snapshot */}
            <div className="p-3 bg-[#F5F3F0] border border-[#EAE5DF] flex items-center gap-3">
              {product.image && (
                <div className="w-12 h-14 bg-[#EFEEEB] overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-serif text-xs text-[#191919] truncate">{product.title}</p>
                <p className="font-sans text-[10px] text-[#77716D] uppercase tracking-wider">
                  Delivered Order #{orderId} {product.selectedSize && `• Size ${product.selectedSize}`}
                </p>
              </div>
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold mb-2">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-[#C29B38] hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-[#C29B38] text-[#C29B38]"
                          : "text-[#D5CEC7] fill-transparent"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="font-sans text-[11px] text-[#7B5644] font-medium mt-1.5">
                {RATING_LABELS[hoverRating || rating]}
              </p>
            </div>

            {/* Patron Name */}
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold mb-1.5">
                Your Name / Display Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full px-3.5 py-2.5 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] placeholder:text-[#77716D]/50 focus:outline-none focus:border-[#7B5644] transition-colors"
                maxLength={60}
              />
            </div>

            {/* Review Note */}
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold mb-1.5">
                Patron Commentary &amp; Fit Note <span className="text-[#7B5644]">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                required
                placeholder="Describe the textile drape, handloom feel, artisan embroidery details, and occasion fit..."
                className="w-full px-3.5 py-2.5 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] placeholder:text-[#77716D]/50 focus:outline-none focus:border-[#7B5644] transition-colors leading-relaxed"
                maxLength={1000}
              />
              <span className="text-[10px] text-[#77716D] block text-right mt-1">
                {comment.length} / 1000 characters
              </span>
            </div>

            {/* Real Customer Photograph Upload */}
            <div>
              <label className="block font-sans text-[10px] uppercase tracking-widest text-[#191919] font-semibold mb-1.5">
                Real Atelier Photo <span className="text-[#77716D] font-normal lowercase">(optional)</span>
              </label>

              {previewUrl ? (
                <div className="relative w-28 h-36 bg-[#EFEEEB] border border-[#EAE5DF] overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Review upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-[#FDFBF8] rounded-full transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border border-dashed border-[#D5CEC7] hover:border-[#7B5644] bg-[#F5F3F0]/50 hover:bg-[#F5F3F0] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <ImageIcon className="w-6 h-6 text-[#7B5644] mb-1.5" />
                  <span className="font-sans text-xs font-semibold text-[#191919]">
                    Upload Real Product Photo
                  </span>
                  <span className="font-sans text-[10px] text-[#77716D] mt-0.5">
                    JPEG, PNG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2">
                {errorMessage}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs uppercase tracking-wider text-[#77716D] hover:text-[#191919] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Patron Review"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
