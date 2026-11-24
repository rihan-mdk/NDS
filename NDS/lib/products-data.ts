export interface AtelierCategory {
  id: string;
  name: string;
  slug: string;
  type: "clothing" | "accessory";
  description: string;
  image: string;
  alt?: string;
  count?: number;
  isCustom?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  subCategory: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  details: string[];
  fabric: string;
  embroidery: string;
  washCare: string;
  deliveryTime: string;
  sizes: string[];
  inStock: boolean;
  featured?: boolean;
  newArrival?: boolean;
  isAccessory?: boolean;
}

export const CATEGORIES_LIST: {
  slug: string;
  name: string;
  count: number;
  description: string;
  image: string;
}[] = [];

export const ACCESSORIES_CATEGORIES: {
  slug: string;
  name: string;
  count: number;
  description: string;
  image: string;
}[] = [];

export const PRODUCTS: Product[] = [];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'all' || !category) return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function getAccessories(): Product[] {
  return PRODUCTS.filter((p) => p.isAccessory || ['bracelets', 'clutches', 'rings'].includes(p.category));
}
