export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

/** The frontend's product shape. Built from the API response in products.service.ts. */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Converted from the API's decimal string. For display; the server calculates real totals. */
  price: number;
  stock: number;
  /** Full image URLs. Empty means no image (a placeholder is shown). */
  images: string[];
  category: ProductCategory | null;
  createdAt: string;
  /** Added in the last 30 days (computed from createdAt). */
  isNew: boolean;

  // Not provided by the API yet. The UI only shows them when they exist.
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
}
