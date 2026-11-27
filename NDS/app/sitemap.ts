import type { MetadataRoute } from "next";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neels-designer-studio.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/accessories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const admin = getSupabaseAdmin();
    if (admin) {
      const [productsRes, categoriesRes] = await Promise.all([
        admin.from("products").select("slug, updated_at").eq("is_archived", false).limit(500),
        admin.from("categories").select("slug").limit(100),
      ]);

      const productRoutes: MetadataRoute.Sitemap = (productsRes.data || [])
        .filter((p: any) => p && p.slug)
        .map((p: any) => ({
          url: `${baseUrl}/product/${p.slug}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));

      const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data || [])
        .filter((c: any) => c && c.slug)
        .map((c: any) => ({
          url: `${baseUrl}/categories/${c.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));

      return [...staticRoutes, ...categoryRoutes, ...productRoutes];
    }
  } catch (err) {
    console.warn("Could not query dynamic sitemap entries:", err);
  }

  return staticRoutes;
}
