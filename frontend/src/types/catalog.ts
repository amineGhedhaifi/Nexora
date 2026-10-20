export type ProductSort = "featured" | "newest" | "price-asc" | "price-desc";

/** Everything the shop can ask for. Maps one-to-one to query parameters on GET /api/products. */
export interface ProductQuery {
  /** Free text matched against name, description and category. */
  search?: string;
  /** Category slug. */
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: ProductSort;
  /** 1-based. */
  page?: number;
  pageSize?: number;
}
