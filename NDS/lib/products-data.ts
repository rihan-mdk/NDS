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

export const CATEGORIES_LIST = [
  {
    slug: 'lehenga',
    name: 'Lehenga Collection',
    count: 12,
    description: 'Handcrafted bridal & festive imperial silhouettes featuring zardozi and antique tilla.',
    image: '/images/cover_images/Lehenga.png'
  },
  {
    slug: 'gown',
    name: 'Gown & Evening Wear',
    count: 9,
    description: 'Sculptural drapery, matka silk weaves, and fluid contemporary luxury.',
    image: '/images/cover_images/gown.png'
  },
  {
    slug: 'short-kurti',
    name: 'Short Kurti & Separates',
    count: 14,
    description: 'Bespoke handloom kurtis adorned with zari needlework and floral lacework.',
    image: '/images/cover_images/short-kurti.png'
  },
  {
    slug: 'pakistani',
    name: 'Pakistani Suits & Anarkali',
    count: 10,
    description: 'Floor-length flared kalis with intricate resham floss and delicate shadow work.',
    image: '/images/cover_images/pakistani.jpg'
  },
  {
    slug: 'korean',
    name: 'Korean Minimalist Edit',
    count: 8,
    description: 'Crisp architectural lines, airy neutral linens, and understated luxury.',
    image: '/images/cover_images/korean.png'
  },
  {
    slug: 'party-wear',
    name: 'Party Wear Couture',
    count: 11,
    description: 'Lustrous metallic accents, crystal embellishments, and evening glamour.',
    image: '/images/cover_images/party-wear.png'
  },
  {
    slug: 'co-ord-set',
    name: 'Atelier Co-ord Sets',
    count: 7,
    description: 'Monochromatic structured separates crafted from breathable pure silks.',
    image: '/images/cover_images/co-ord-set.jpg'
  },
  {
    slug: 'jeans',
    name: 'Artisan Handcrafted Denim',
    count: 6,
    description: 'Premium Japanese selvedge denim tailored with subtle heritage bullion motifs.',
    image: '/images/cover_images/jeans.png'
  },
];

export const ACCESSORIES_CATEGORIES = [
  {
    slug: 'bracelets',
    name: 'Bracelet',
    count: 6,
    description: 'Filigree heritage cuffs, 22k gold foiling, and meenakari craftsmanship.',
    image: '/images/cover_images/Bracelet.jpg'
  },
  {
    slug: 'clutches',
    name: 'Clutches',
    count: 8,
    description: 'Hand-sewn velvet potlis with bullion wire cord and pearl tassels.',
    image: '/images/cover_images/clutches.jpg'
  },
  {
    slug: 'rings',
    name: 'Rings',
    count: 5,
    description: 'Uncut polki diamonds set in royal kundan foil mounts.',
    image: '/images/cover_images/rings.jpg'
  },
];

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
