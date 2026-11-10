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
    name: 'Bracelets & Cuffs',
    count: 6,
    description: 'Filigree heritage cuffs, 22k gold foiling, and meenakari craftsmanship.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQd_Bl8-29VL_EkcAAe3uI4Mx5aTxlzLLbaDPU4N7hBLurX7il5yqNe52gPYHGos9P-nXlZFWbccr6VHXBBmSHGDf7h2E7Xl759UGAOpW1SGiKeCf46YRWigV_A4UZlEnF5qss3WS4vUW9WzEGspnDetazXHuy1jlQRGAqUCHcDBmBHN47hc0UT2ttRsCqnj28cn4INi87FSavEb9eZ8LZcqUqiRhbVUnDnt9gzBgM'
  },
  {
    slug: 'clutches',
    name: 'Clutches & Potlis',
    count: 8,
    description: 'Hand-sewn velvet potlis with bullion wire cord and pearl tassels.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg4fEf5pO9178NLlTyF2p2U0sUBWW4zY3gJh1_88s9j8HmpLQiY6jT44friUru7ejw2P8cdcRuyeNxISzQm56fs_P9m7IIyp3rOV_t-NsOnPF7idSQlYkFYT6pJDlXfSnw8dZSqs9qrsOdghNfhCSo_lH69f3fTkkJSrXLurEz3KQZwCTikLlD2HJMQqBQThgWK2FY9_BDFlVW1F7rIIpmSFLWMuk-F4QjJkVWiUR8'
  },
  {
    slug: 'rings',
    name: 'Statement Rings',
    count: 5,
    description: 'Uncut polki diamonds set in royal kundan foil mounts.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvk8J6o7zxSCxL0DNrDShrTtnmHzoBCNVDp1mhNa6ehWAzo2TusQ-oM5r6wh3jEGRFWJjVgNcG1wTeSA9MIiIFKESLGwkEtS1bbgQdXiRefG2nGneDCUTIiEghgVFqq7dpP_Fz1QA-1bU7aZQGQJFfYo7qhp3EKQ4ywU0vrAOAs3fWRF4YPJcAj61W5KS4cqmUGkofisrtQm7DRuvP61f_PusGAragBx_DVLS1ie3z'
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'zari-embroidered-azure-silk-kurti',
    title: 'Zari Embroidered Azure Silk Kurti',
    category: 'short-kurti',
    categoryLabel: 'Short Kurti',
    subCategory: 'Silk Separates',
    price: 48000,
    originalPrice: 54000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDa7YtcMTAGCoRTMGeM2MQ4PPSUE3nY0ndT95g079HbkTfqGHcvSmi2i5uosF3JpeEts49lsQtMrSjOn5DAwxYy_PCocNB9ztqPFEzu18u7ENCJR4nJ2Vr-ZcwGUPmOZlDbsNyVHMrOm7tIHBrS4gi0yg7PSuIg6enaBTquUSZ4lzLI6Kae9YyaZcuXI15higHIEI1hrCpamHkqfR6lIDaJNopFMnY5lO6Z4GGzX-qA',
    ],
    description: 'Impeccably tailored in pure mulberry silk, this azure short kurti showcases delicate antique gold zari needlework along the scallop hemline and sleeve cuffs. Designed for serene gatherings and festive celebrations.',
    details: [
      'Pure Mulberry Chanderi Silk outer shell',
      'Hand-cut scallop border with micro-pearl detailing',
      'Breathable organic cotton lining for all-day ease',
      'Concealed side zipper and fabric button placket'
    ],
    fabric: '100% Chanderi Silk with Cotton Mul Lining',
    embroidery: 'Hand Needle Zari & Delicate Gota Patti',
    washCare: 'Specialist Dry Clean Only. Store in breathable muslin bag.',
    deliveryTime: 'Ships within 3-5 business days via BlueDart Express',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
    newArrival: true,
  },
  {
    id: 'prod-002',
    slug: 'ivory-architectural-drape-gown',
    title: 'Ivory Architectural Drape Gown',
    category: 'gown',
    categoryLabel: 'Gown',
    subCategory: 'Evening Couture',
    price: 125000,
    originalPrice: 140000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP1jB0EnAx5-BWz9llTztchW9JV99Bp_6dxn81cecC2scMHD66B601WWnTHDJ9y8ruH5ihhMgw3ix-IWsvbE1vnMvvfavusPQxKnbJZt7vJ8_BRAOalr-mnZ6canprIG7eGUo6-1cxUSvUVpgzJaAL3JoXMyiCUjzf-lpXL5YR6fMA6XRzy5TEJ82yzFxULcxWn2u8BMKvvlBEiZMhfcoNNPZgfkAqg6Svb-KNkJxI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCM05KT-wr6KIy61aaOgK_a90RWm1eazWi0XDmU5tZSfAtwABYYv92--MI0krKPApZNgT2ydHKBr9RCxMgOj8EneI9k8EGbTtCmChCGhLwpngkv_Og2E-3tKMBCQvEg77LO2nV-eWGEmD45q9BhjlvWE_MzRR78aShCNdkeP2aOx8Dp619o4QPKmQGdRyUuTzT_umhv3_8yFbZieBmuvl_-WYU-CnwrrZg-0ZNvWxUS',
    ],
    description: 'A monument to modern drape artistry, crafted in raw matka silk with structural pleats cascading into an elongated train. The asymmetric neckline balances restraint with red-carpet drama.',
    details: [
      'Raw Matka Silk handwoven by Bengal artisans',
      'Internal boned corset structure for bespoke fit',
      'Signature asymmetric draped shoulder cape',
      'Floor-sweeping column silhouette'
    ],
    fabric: 'Pure Handwoven Matka Silk with Crepe Lining',
    embroidery: 'Minimalist Tonal Cord Stitching',
    washCare: 'Professional Atelier Care / Dry Clean Only.',
    deliveryTime: 'Made to Order: Ships in 7-10 business days',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    featured: true,
    newArrival: true,
  },
  {
    id: 'prod-003',
    slug: 'noorani-zardozi-bridal-lehenga',
    title: 'Noorani Zardozi Bridal Lehenga',
    category: 'lehenga',
    categoryLabel: 'Lehenga',
    subCategory: 'Bridal Ensemble',
    price: 345000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAGI0_cO5ClKf1y-Gd8vqwUxyqHC8sMKJROxAR5CB_UiAlJtLEyutvzsgaZueaUeoDg0D81FENmW81EqV9ho14uMJEncaoBzzNhDerTmOEtOyC-Afmk71RvmTle4U9eyatvXTl6fYiD7qDB4_YtTaPsddn1vKXlDIWQkO7M0t5Jn5MSLrNT6hTJOJRP5Krr8AHtnc4Eb69oNTSzi0T0BkEUGObJuYo6Teh_qwaREu69',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCDZB1C1b4wIsUj3r9TJv0bP2nAQsOIjfm9ExraVyeejU1laqBIbigB_0OeP0raLA2BbbBkfuGpsYIArl6b0t6_V14eSXlW0uq7iGZGFoo04S69k_Bwu_zJIB1nLrnXSi-hdHF__CsnKvIDEjwxJfY0S-0DYemri-iq3cj1Xe2rlLN3RalnNcy89Rk_oLIhptPJW5nMO-jCcyVfBsREBz8bImhLH6s_ow1u9uuAoT0V',
    ],
    description: 'An imperial masterpiece in deep royal crimson velvet, encrusted with 400 hours of pure silver dabka, bullion wire, and micro-pearl zardozi handcrafting. Paired with a gossamer organza dupatta.',
    details: [
      '16-kali flared skirt with double cancan understructure',
      'Pure silver electroplated tilla and dabka needlecraft',
      'Complementary sheer organza dupatta with scalloped borders',
      'Custom waist fitting tailored to your exact measurements'
    ],
    fabric: 'Heritage Silk Velvet & Sheer Silk Organza',
    embroidery: 'Authentic Lucknowi Zardozi & Silver Dabka',
    washCare: 'Preservation Dry Clean Only. Heirloom archival box included.',
    deliveryTime: 'Atelier Couture: 2-3 weeks bespoke preparation',
    sizes: ['S', 'M', 'L'],
    inStock: true,
    featured: true,
    newArrival: true,
  },
  {
    id: 'prod-004',
    slug: 'the-noor-kundan-statement-ring',
    title: 'The Noor Kundan Statement Ring',
    category: 'rings',
    categoryLabel: 'Accessories',
    subCategory: 'Fine Jewellery',
    price: 85000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvk8J6o7zxSCxL0DNrDShrTtnmHzoBCNVDp1mhNa6ehWAzo2TusQ-oM5r6wh3jEGRFWJjVgNcG1wTeSA9MIiIFKESLGwkEtS1bbgQdXiRefG2nGneDCUTIiEghgVFqq7dpP_Fz1QA-1bU7aZQGQJFfYo7qhp3EKQ4ywU0vrAOAs3fWRF4YPJcAj61W5KS4cqmUGkofisrtQm7DRuvP61f_PusGAragBx_DVLS1ie3z',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhJ7YWvClS4mBsF75YnNUPTicQ1e1wxOprvOTU5u4RZ4S6_qsEYY0vC1AEYElVlLP6xOczPXJZfnYsr1jrs8Hy2YL1UPydB0YL6inJgx0zc2_5HoTa4PhCWgus9CgwKo3KlLnXsxhdkgvD3KHgIE_nIhUAlMQumEngTB-ImBfMMtoI7wSKTDxyoa0JlQH660lD3uUXvcfKVW8IJ1DAl40zVa1RSu6-1EmJ6JwHrp3T',
    ],
    description: 'Handcrafted by third-generation Jaipur karigars, featuring a central uncut polki diamond encased in 22k yellow gold leafing with reverse enamel miniature artwork.',
    details: [
      '22k Gold Foiled Sterling Silver frame',
      'Uncut Polki Diamond with natural inclusions',
      'Reverse Persian Meenakari enamel detailing',
      'Adjustable luxury band to fit all finger sizes comfortably'
    ],
    fabric: 'Sterling Silver with 22 Karat Gold Vermeil',
    embroidery: 'Hand Jadau Setting & Cloisonné Enamel',
    washCare: 'Wipe with soft chamois cloth. Avoid perfumes and dampness.',
    deliveryTime: 'Ships within 48 hours in luxury velvet presentation casket',
    sizes: ['Free Size (Adjustable)'],
    inStock: true,
    featured: true,
    newArrival: true,
    isAccessory: true,
  },
  {
    id: 'prod-005',
    slug: 'heirloom-velvet-zari-potli',
    title: 'Heirloom Velvet Zari Potli',
    category: 'clutches',
    categoryLabel: 'Accessories',
    subCategory: 'Clutches & Potlis',
    price: 38000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBg4fEf5pO9178NLlTyF2p2U0sUBWW4zY3gJh1_88s9j8HmpLQiY6jT44friUru7ejw2P8cdcRuyeNxISzQm56fs_P9m7IIyp3rOV_t-NsOnPF7idSQlYkFYT6pJDlXfSnw8dZSqs9qrsOdghNfhCSo_lH69f3fTkkJSrXLurEz3KQZwCTikLlD2HJMQqBQThgWK2FY9_BDFlVW1F7rIIpmSFLWMuk-F4QjJkVWiUR8',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB0mk8WIqZtSlsD9FyyNAxeVKyppQGr5PONxcf5x1ycuPXROo2kSISl9iZJD5JPAlqhTxZag9zb9zf7Mn2BaTv8a4E-IAi828k4kDay3ngNlfG5W8itk7svNmmAJbx6LfgJU64Yza0LaywCfFcRz9FhBs-aXXyRuAdBIGh-1BDr3L2uT_9TXI0sMbb2IRqNAorMSD5c8bAUUmZlAec2y7FG3AKaUFdgW3XG2XWztk7y',
    ],
    description: 'An essential companion for evening galas, rendered in plush black velvet with intricate bullion cord work, seeded pearls, and heavy braided silk drawstring tassels.',
    details: [
      'Ultra-dense black silk velvet body',
      'Gold bullion wire and cultured seed pearl accents',
      'Hand-twisted silk cord with metallic latkan drops',
      'Generous interior accommodating modern smartphones'
    ],
    fabric: 'Pure Silk Velvet & Satin Interior Lining',
    embroidery: 'Marodi & Zardozi Hand Craft',
    washCare: 'Store in soft velvet pouch. Gentle spot clean only.',
    deliveryTime: 'Ships in 2 business days',
    sizes: ['Standard Size (24cm x 18cm)'],
    inStock: true,
    featured: true,
    isAccessory: true,
  },
  {
    id: 'prod-006',
    slug: 'chandrakala-heritage-lehenga',
    title: 'The Chandrakala Lehenga',
    category: 'lehenga',
    categoryLabel: 'Lehenga',
    subCategory: 'Imperial Couture',
    price: 285000,
    originalPrice: 310000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA32m-r1djVXMtzSCI3FDkCQ9alqyAkExyQ34QuMXyoB0s3yxu_8PKsJZyhxNw265oJgmChAHITV8hMVZgr5BCmudXFSlpTsb-dRAL_GnOw1JmrJEk9f84dgPMr_Cc3F5sPu9NCphUnQAmD3Wn4xuzZjbssHOBwvplF5CPOlHfHjWHVYsDx7maH3RkjIjDsJioNuw5GTQIBlQjPMXM2YPy-khRSRq-D7PL5Xi2a1uRf',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiQsFXd97zN_6MX6lCdx2pk69lyIKBeEZPafyymYBszsaPXrw5RUlAR8fxd2jk9Xr5zvEge7cKHj9WKRCiDe_j5J2LogOL0tIDnLUGI0Log2Y9UmxaEpLVqfoNFg2CKWMKwb02SsNAAjapWpYJF-Pqn9U2ED2CZrgHDLqiiNAc91cv_sI6HjoGDmBdiPxm2-lFixRyQP5h8GREmAFV_oC6sHursNBwfMcl991y0HSj',
    ],
    description: 'Inspired by celestial moonlight over ancient courtyards, The Chandrakala combines soft sage georgette with delicate silver sequin rivers and pearl jaal embroidery.',
    details: [
      'Pure Georgette with micro-shimmer base',
      'Intricate lattice jaal pattern with glass seed beads',
      'Comes with handcrafted unstitched silk blouse piece',
      'Flared 6-meter hemline with reinforced cancan'
    ],
    fabric: 'Pure Silk Georgette with Satin Crepe Lining',
    embroidery: 'Chikankari, Mukaish & Cutdana Work',
    washCare: 'Dry clean only. Do not iron directly on embroidery.',
    deliveryTime: 'Ships within 10-14 days',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    featured: true,
  },
  {
    id: 'prod-007',
    slug: 'korean-minimal-linen-trench',
    title: 'Minimalist Korean Linen Drape Ensemble',
    category: 'korean',
    categoryLabel: 'Korean',
    subCategory: 'Contemporary Separates',
    price: 32000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6DcBzbtG5zHZ_4Tnl4Ed_pbPIFf4Bi8H0GS22bK_oUSQlnVInYs-96mv1uNbG4SdQrCRDAAEIqN7WuRA-NEtIcokpJaJiDweT3NDljS5U0eOfacW2IbW7WYpxM5c2BmoVvQCEYA6LYhqsh7tmGLR6Wu-clTAvdYZWH3q19-ZoDs_JwW7HyHghB1WQz3PLCorGDFJwDyBimDIfBLfHCGy2zhExQjP44xl1hqbhz8lS',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCs_Gk-skZmje9I1LA2f8zF6jADX9iGDImEuiVJwQ2IWnUok1lXO91QA2bnOx84rPoG4FElPAAm4t8_neikL9V0BCdd-FFKAnkox4dKehGDq-upI1jJLjiGavUjUuOAT56AfflSrAdxEsbFJXBiG_QULGC1A99kUUkhqHOxXft0LUfQLOw_pvcjqhRMxqQolC2fRgir7mnIa0Zn7ymNgfLUtsNn-8IysngfaN39RSaL',
    ],
    description: 'Clean architectural lines meet Seoul-inspired minimalist tailoring. Designed with an oversized drop-shoulder fit, asymmetric belt sash, and raw fringed lapels.',
    details: [
      '100% Organic European Washed Linen',
      'Oversized silhouette with self-tie wrap closure',
      'Deep dual inseam patch pockets',
      'Unstructured relaxed collar'
    ],
    fabric: '100% Breathable European Flawed Linen',
    embroidery: 'Raw Selvedge Fringing',
    washCare: 'Cold water gentle hand wash or eco dry clean.',
    deliveryTime: 'Ships in 3-5 days',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
    newArrival: true,
  },
  {
    id: 'prod-008',
    slug: 'pakistani-resham-chikankari-suit',
    title: 'Lahori Resham & Chikankari Kurta',
    category: 'pakistani',
    categoryLabel: 'Pakistani',
    subCategory: 'Heritage Pret',
    price: 54000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdgqTEm_9UhQYsscfcIk5TC3NnKJykm_Ts_dURhq_mGOLyICtEqNPHQxJAi1m1a5LKUydjuTLP1JSnz8p6ch7yH7L9si-nUYedb889I-t14RHG7HAchdaSXgg6LTBGzjH3c7Gqajy4oLeQKJTOQK0PLXpDPBFKDEJ593uwCeU2cNf0V0ThIBd4uq3VsDWkU34dOy6IXQPUxKZCa3cnYN3K0jtitWqnAyWzbx3SGynJ',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALhSGBHPEZEUWmd4k16gXwlmGXtiEren5uBkyax4zogA6zFgoLMGZzAj17o8vd7z-7FjreWp3wvRRm98b5fgslpHd97M3JAeArz4YGLUwGIa3tGYIEiUbSlaNsMmpzeL0dpXKxp_3Ct7GXNdbp9qnUIUVdHh7sM71yjKGT9EuhNb9YY96xpdVqvu1p2jrU0kIYAUtIJp_yZobh4XEQllVw-nSEj9EB0iz4IAZ0YIhE',
    ],
    description: 'An elongated flared kurta reminiscent of old Lahore estates. Dense resham floral motifs cascade over pure lawn cotton, edged with bespoke organza shadow lace.',
    details: [
      'Premium Pima Lawn Cotton',
      'Hand-stitched bakhia and shadow stitch flora',
      'Paired with straight-cut lace detailed culottes',
      'Featherlight printed chiffon dupatta'
    ],
    fabric: '100% Superfine Cotton Lawn & Pure Chiffon',
    embroidery: 'Authentic Resham Thread & Lace Inset',
    washCare: 'Gentle dry clean.',
    deliveryTime: 'Ships in 4 business days',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    newArrival: true,
  },
  {
    id: 'prod-009',
    slug: 'contemporary-sequin-party-wear',
    title: 'Starlight Sequin Evening Slit Gown',
    category: 'party-wear',
    categoryLabel: 'Party Wear',
    subCategory: 'Red Carpet Glamour',
    price: 68000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdT-xNFUh3RpOCVGpofbw1KlVAhvmNDnh2HC7GmuCaOFKOVydhmwa3apm9UBEdCdQVlzjxyUfp8Q5u27cDyl0wCKPNjg_krM_DX4pLF90B_ANu6-GBlP96cIdWTgzzJ3o2Mw2_JQJBXEjOoGkXdFl5P1e4C-l6tasRoIbdflvwubcJC2TZHVZW3SSD0xcJl_KkL6E2H12E8mzXYWB461qxciLPuRz1Tt_jsKVZZvp4',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDygMaj_lDfQCEX3q1XUhnqjqorEbLqn8Unq3ub-8Vj9iWwkZdkOjs8LkF28AqH7XQMnk2Wddy4ood_DL6HiceiKTeI4netVbMRuKkRSw3nnJxgGgQ_FFcySriGNo7RoWwg6LG7WQk7nml2vHfTrzF0ryRSK4_Gnb1AIgKun3DaUu7iLxFwCl81cI7Fp0H1m5OMQN-tlyZ_KZllcZUdyiB2x1tOUGNovA5UeOeZ_prD',
    ],
    description: 'Sculpted for high-energy gala nights and soirées. Hundreds of micro midnight sequins shimmer organically over an inner shapewear slip with an alluring thigh-high slit.',
    details: [
      'Stretch mesh foundation with micro-paillette sequins',
      'Internal body-contouring lining',
      'Statement open back with crossed delicate straps',
      'Hidden zipper with secure hook and eye'
    ],
    fabric: 'Stretch Micro-Mesh with Viscose Spandex Lining',
    embroidery: 'High-Density Micro Sequin Sheen',
    washCare: 'Specialist delicate dry clean only.',
    deliveryTime: 'Ships in 5-7 business days',
    sizes: ['XS', 'S', 'M', 'L'],
    inStock: true,
  },
  {
    id: 'prod-010',
    slug: 'atelier-sculpted-co-ord-set',
    title: 'Pleated Raw Silk Co-ord Set',
    category: 'co-ord-set',
    categoryLabel: 'Co-ord Set',
    subCategory: 'Atelier Separates',
    price: 28500,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBn_ZO4jtOVo8LVlLnqJOa0sNKA-Wp5L-8MRWFmKOKxyd4WIXbQGKD22TKop98TdSUPOUbnue-PnOS0F22bap-oJTRnKyAuOwvmQ7gB612hfjqyeILQUUWEYkW_C09VuBKE7jOGElfWuHiJ5wiezjx2Cp88LnjCn_a-cTl1hFL3Xo6XFIU7j4BY_VGo0H_LYEiPeeg4vLInHLoY6HTwWd4qG6ATDXqGZ3suQJHgljP0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuCbc88grQ4WV9P3FZO9jCY7gApELjwc9GndpjzkAC0DrwZBuI-25wyYP_fNe_WLOZv0ufYmTTISRM520z-MyQ6YP9BIw7p6I-JXUSy_tKqbaEo7C_3LH5FPJ7PV50avI8gfc5gs5O_ce4o5IFJc2k5ZDFP3E1Np2Xxk0YEZquobWwlQBDgc01gRSQSIMPAPFbDLpckhuOXuRA5L7w3bCLeVg-EWbYRPHdzKFBNVUc',
    ],
    description: 'An understated monochrome set featuring a wrap-front kimono blouse and high-rise palazzo trousers. Finished with tonal Mother-of-Pearl buttons.',
    details: [
      'Textured Handspun Raw Silk',
      'Elasticated rear waistband for tailored comfort',
      'Flattering wrap silhouette with inner anchor button',
      'Versatile as coordinates or standalone pieces'
    ],
    fabric: '100% Handspun Raw Silk',
    embroidery: 'Tailored Edge Topstitching',
    washCare: 'Dry clean recommended.',
    deliveryTime: 'Ships in 2-4 business days',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
  },
  {
    id: 'prod-011',
    slug: 'bespoke-embossed-denim-jeans',
    title: 'Hand-Embroidered Tonal Jeans',
    category: 'jeans',
    categoryLabel: 'Jeans',
    subCategory: 'Artisan Denim',
    price: 18500,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABqG1V_7BzODuslTpgTHl6ju_8nWtiLu9RQgrb7uESTr0quwlr2lGdVWg5lTla0zXtyO5xqr3Pd7LNB5IqJy_9hErkdycWrEsbSVgnAdIILYYY7uOBXuTe0de8J6yQCychEztGm_Z2Gr14wfwZuOVgNs32lr5BSs_sAtNhNCv3gAKN5J3l_BNohzHB5U5sbY7GDWlwsJ5FxAziMJ_j1LHHDbBAssbJOGDzHc-Edllg',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASHD09KDCCwgkrK5sxWXyxHucm6-wc3lG0GN4jwpjs4rURnpoPFEVc5kQxxg577s7skgvHB0hob-vSBGgg8lsG0ysDaKkznLvjh_GlVgL2wL6-HSLnDYih87v0M1d83xg3FeVCCQEleGLVT_o6kABiuPqxd1jULWnL3V7W9lcvxvCB7jR58x9wyhQZ_NwkjNNVF-qMPZFGGViRyx4j3NWKIJ0HYZcAE6AeZc7BkWqk',
    ],
    description: 'Crafted from 13.5oz shuttle-loom Japanese selvedge denim, embellished with tonal botanical threadwork along the pocket trims and outer seam.',
    details: [
      '13.5oz Kuroki Mills Selvedge Denim',
      'Custom gunmetal branded buttons & copper rivets',
      'Mid-rise relaxed straight-leg profile',
      'Hand-abraded natural fading'
    ],
    fabric: '100% Japanese Selvedge Cotton Denim',
    embroidery: 'Tonal Sashiko Pocket Embroidery',
    washCare: 'Turn inside out, gentle wash in cold water or dry clean.',
    deliveryTime: 'Ships in 3 days',
    sizes: ['26', '28', '30', '32', '34'],
    inStock: true,
  },
  {
    id: 'prod-012',
    slug: 'meenakari-jadau-cuff-bracelet',
    title: 'Heritage Meenakari Filigree Cuff',
    category: 'bracelets',
    categoryLabel: 'Accessories',
    subCategory: 'Bracelets & Cuffs',
    price: 46000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQd_Bl8-29VL_EkcAAe3uI4Mx5aTxlzLLbaDPU4N7hBLurX7il5yqNe52gPYHGos9P-nXlZFWbccr6VHXBBmSHGDf7h2E7Xl759UGAOpW1SGiKeCf46YRWigV_A4UZlEnF5qss3WS4vUW9WzEGspnDetazXHuy1jlQRGAqUCHcDBmBHN47hc0UT2ttRsCqnj28cn4INi87FSavEb9eZ8LZcqUqiRhbVUnDnt9gzBgM',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpdjkr8uV5N7c1m1WTGcsonP4CsIPw-krN5_rP8VGaauzpcDQiuNZkhtiLSPFEdXdCrraNp7LSbqX1LHg59t9UMVLOkOtxiqT6inly4rjoP8KtrVlYNGELNLUvRvWlHZguWlZ-PMeMKHU0fXUaTN7CHxsOrhI9T-V_cE0-EggjKmMJhHR6UFeA8K_Anq0tPu9IHXtihc-bMAAqTnPBsNYTMqfpb1ynOvr93ZXPS5oh',
    ],
    description: 'An open-hinged bangle cuff cast in sterling silver with generous 22k gold vermeil, detailed with traditional green and ruby meenakari flora and bezel-set tourmalines.',
    details: [
      '925 Sterling Silver core with 22k gold electroplate',
      'Traditional hand-painted vitreous enamel',
      'Natural untreated semi-precious pink tourmalines',
      'Security screw clasp mechanism'
    ],
    fabric: 'Gold Vermeil on 925 Sterling Silver',
    embroidery: 'Meenakari & Jadau Inlay',
    washCare: 'Store in airtight box away from direct light.',
    deliveryTime: 'Ships in 48 hours',
    sizes: ['Standard 2.4 - 2.6 Wrist'],
    inStock: true,
    isAccessory: true,
  },
  {
    id: 'prod-013',
    slug: 'architectural-brushed-gold-cuff',
    title: 'Architectural Matte Gold Cuff',
    category: 'bracelets',
    categoryLabel: 'Accessories',
    subCategory: 'Bracelets & Cuffs',
    price: 52000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBoogUoBGH2hrECQ0cKkT8OO8lWM7lkrb3k8luQq0gW9iCGCNXxRVcnuOaPu-KuGeErvF0w-U-gNxrJe-WeTJPuCVHsVgTCJXMw1OPgL2yxpIH7aa_s0juZlAz1IlvSuWZHWkCWzFoATE2AF-iV_E5ZtNQ5EQ9paxtj12hocfIUSXwyFPM6lb-vPpW0xHfFkGIGXjqG_pEkX9QoH4pSe18an9w2W6UWiGB-_DgmLnzX',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpdjkr8uV5N7c1m1WTGcsonP4CsIPw-krN5_rP8VGaauzpcDQiuNZkhtiLSPFEdXdCrraNp7LSbqX1LHg59t9UMVLOkOtxiqT6inly4rjoP8KtrVlYNGELNLUvRvWlHZguWlZ-PMeMKHU0fXUaTN7CHxsOrhI9T-V_cE0-EggjKmMJhHR6UFeA8K_Anq0tPu9IHXtihc-bMAAqTnPBsNYTMqfpb1ynOvr93ZXPS5oh',
    ],
    description: 'Sculptural brutalist folds in matte 18k brushed gold plating over sterling silver, inspired by modern architectural forms.',
    details: [
      '18 Karat Brushed Gold Electroplate',
      'Solid 925 Sterling Silver base',
      'Ergonomic contour for comfort',
      'Hallmarked signature atelier engraving'
    ],
    fabric: '18k Brushed Gold on Sterling Silver',
    embroidery: 'Hand-Finished Brushed Satin',
    washCare: 'Store in archival flannel pouch.',
    deliveryTime: 'Ships in 3 days',
    sizes: ['Free Size (Slightly Flexible)'],
    inStock: true,
    isAccessory: true,
  },
  {
    id: 'prod-014',
    slug: 'kundan-floral-hathphool-bracelet',
    title: 'Kundan Floral Hathphool Bracelet',
    category: 'bracelets',
    categoryLabel: 'Accessories',
    subCategory: 'Bracelets & Cuffs',
    price: 64000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhJ7YWvClS4mBsF75YnNUPTicQ1e1wxOprvOTU5u4RZ4S6_qsEYY0vC1AEYElVlLP6xOczPXJZfnYsr1jrs8Hy2YL1UPydB0YL6inJgx0zc2_5HoTa4PhCWgus9CgwKo3KlLnXsxhdkgvD3KHgIE_nIhUAlMQumEngTB-ImBfMMtoI7wSKTDxyoa0JlQH660lD3uUXvcfKVW8IJ1DAl40zVa1RSu6-1EmJ6JwHrp3T',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCQd_Bl8-29VL_EkcAAe3uI4Mx5aTxlzLLbaDPU4N7hBLurX7il5yqNe52gPYHGos9P-nXlZFWbccr6VHXBBmSHGDf7h2E7Xl759UGAOpW1SGiKeCf46YRWigV_A4UZlEnF5qss3WS4vUW9WzEGspnDetazXHuy1jlQRGAqUCHcDBmBHN47hc0UT2ttRsCqnj28cn4INi87FSavEb9eZ8LZcqUqiRhbVUnDnt9gzBgM',
    ],
    description: 'An ethereal bridal hathphool linking an ornate floral wrist cuff to a delicate finger ring with seed-pearl strands.',
    details: [
      'Fine 22k gold vermeil finish',
      'Uncut glass polki stones in silver collets',
      'Natural freshwater seed pearl links',
      'Adjustable hook clasp'
    ],
    fabric: '22k Gold Foil on Fine Brass',
    embroidery: 'Hand Jadau Craftsmanship',
    washCare: 'Keep away from humidity and perfumes.',
    deliveryTime: 'Ships in 3-5 days',
    sizes: ['Free Size (Adjustable)'],
    inStock: true,
    isAccessory: true,
  },
  {
    id: 'prod-015',
    slug: 'marodi-champagne-raw-silk-potli',
    title: 'Marodi Champagne Raw Silk Potli',
    category: 'clutches',
    categoryLabel: 'Accessories',
    subCategory: 'Clutches & Potlis',
    price: 42000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDq8uTlMHtRGvC8IgsOZqkSa61QdFo0v6114sEi8bzJfX3JVCabM4NP2kuqK6uCCCdSCiI6JjUiV0xD0yqmubsZtzk9Qqkhb38yM35hiXX3QoGM_mkYZNNFfwXpjwMnGfzY8fnIiFCY7ekD3Qbw005FbWve0EUPAxtVJgsTfdYT4G5krpMTvi4tU5taZ-KOn_axN5OuZQSQZg1GJqoWyGBCUYmZTl8Xfl7kuOhi_Dte',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBg4fEf5pO9178NLlTyF2p2U0sUBWW4zY3gJh1_88s9j8HmpLQiY6jT44friUru7ejw2P8cdcRuyeNxISzQm56fs_P9m7IIyp3rOV_t-NsOnPF7idSQlYkFYT6pJDlXfSnw8dZSqs9qrsOdghNfhCSo_lH69f3fTkkJSrXLurEz3KQZwCTikLlD2HJMQqBQThgWK2FY9_BDFlVW1F7rIIpmSFLWMuk-F4QjJkVWiUR8',
    ],
    description: 'Rendered in pure ivory raw silk with antique champagne marodi needlework, embellished with crystal drops and braided tassel cords.',
    details: [
      'Handspun pure raw silk foundation',
      'Antique gold marodi wire embroidery',
      'Heavy beaded tassel cord closure',
      'Soft satin inner lining with card pocket'
    ],
    fabric: '100% Handspun Raw Silk & Metallic Thread',
    embroidery: 'Antique Marodi & Zardozi',
    washCare: 'Spot clean only with dry cloth.',
    deliveryTime: 'Ships in 3 days',
    sizes: ['One Size (22cm x 17cm)'],
    inStock: true,
    isAccessory: true,
  },
  {
    id: 'prod-016',
    slug: 'regal-uncut-polki-cocktail-ring',
    title: 'Regal Polki Cocktail Ring',
    category: 'rings',
    categoryLabel: 'Accessories',
    subCategory: 'Statement Rings',
    price: 76000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZKb5wq4FCQE1QSI9GB7YXyO_PBH0M19yabqbIx5KrqskaopY4ja26UG-EbEzux8Ir7Z7ZHCaY4M3pU0kUQ6tP_jXVI2Mfra6UiVbHSstS2kzX18IJsdzYRVq1SunD9AzEMAOyXtMm1Q4o46pX_x4uwMIiSAm33Z6PCumqWJua9mcUevWUcZ4kBBqVgOuQ22dmWd50tC0YkdH4eD-KGFPlsZJP2NvTUJZtI4P8sV-2',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAzcVOWYJb1gD6fk7UwqLMJCcFi5ffOrtlxPtknpZ5fplAAmUoNHnn8sl2eAiXRqMn_G_iMSZwzLKY6WzsLEK6muv-QLfwJmBZHcZjFs6tifDN9hax5AY6tEGGsX5Ngyw8UlonXjw6_b5v2waq7efXSNv6f0n4E9nKCyWXbD5FOw_cXetIaLGTF6DUf3qoxIEdgh_7Sz7WMMqxwxpU40w1ftRlOyhul0mo0AVsGoTB',
    ],
    description: 'An imposing statement cocktail ring featuring radiant cluster-set polki stones, haloed by micro seed pearls in 22k gold vermeil.',
    details: [
      '22 Karat Gold plated silver setting',
      'Cluster of unblemished polki stones',
      'Cultured seed pearl halo perimeter',
      'Adjustable band with inner sizing spring'
    ],
    fabric: '22k Gold Foil on Sterling Silver',
    embroidery: 'Hand Jadau Setting',
    washCare: 'Preserve in velvet jewelry box.',
    deliveryTime: 'Ships in 48 hours',
    sizes: ['Free Size (Adjustable)'],
    inStock: true,
    isAccessory: true,
  }
];

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
