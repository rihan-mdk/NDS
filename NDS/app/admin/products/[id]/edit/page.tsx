"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { getAllLiveProducts, saveProductToStorage } from "@/lib/products-store";
import { Product } from "@/lib/products-data";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setLoading(true);

      // 1. Instant check from local cache
      const allLocal = getAllLiveProducts();
      const localFound = allLocal.find((p) => p.id === id || p.slug === id);
      if (localFound && isMounted) {
        setProduct(localFound);
        setLoading(false);
      }

      // 2. Fetch live authoritative product from Supabase / cloud API
      try {
        const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          const cloudProduct: Product | undefined =
            data.product ||
            (Array.isArray(data.products)
              ? data.products.find((p: Product) => p.id === id || p.slug === id)
              : undefined);

          if (cloudProduct && isMounted) {
            setProduct(cloudProduct);
            saveProductToStorage(cloudProduct);
            setLoading(false);
            return;
          }
        }

        // Fallback: fetch complete product list if single lookup wasn't matched
        const resAll = await fetch("/api/admin/products");
        if (resAll.ok) {
          const data = await resAll.json();
          if (Array.isArray(data.products)) {
            const matched = data.products.find((p: Product) => p.id === id || p.slug === id);
            if (matched && isMounted) {
              setProduct(matched);
              saveProductToStorage(matched);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Error fetching product from cloud API:", err);
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }

    return () => {
      isMounted = false;
    };
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

