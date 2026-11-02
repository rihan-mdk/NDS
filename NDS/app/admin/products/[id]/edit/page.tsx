"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getLiveProductById, getAllLiveProducts } from "@/lib/products-store";
import { Product } from "@/lib/products-data";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const all = getAllLiveProducts();
    const found = all.find((p) => p.id === id || p.slug === id);
    setProduct(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#EAE5DF] border-t-[#7B5644] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#77716D]">Loading product dossier...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-12 bg-white border border-[#EAE5DF] text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h2 className="font-serif text-xl text-[#191919]">Product Not Found</h2>
        <p className="text-xs text-[#77716D]">
          The product ID &quot;{id}&quot; does not match any atelier creation in the active catalog.
        </p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Products</span>
        </Link>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}

