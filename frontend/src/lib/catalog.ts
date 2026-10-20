import type { ProductQuery, ProductSort } from "@/types/catalog";

/** The shop's filter state. It lives in the URL: /shop?category=home&min=25&max=49.99&sort=price-asc&page=2 */
export interface ProductFilterState {
  search: string;
  /** Category slug, "" = all. */
  category: string;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: ProductSort;
  page: number;
}

export const DEFAULT_FILTERS: ProductFilterState = {
  search: "",
  category: "",
  inStock: false,
  sort: "featured",
  page: 1,
};

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Default" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const PRICE_RANGES: {
  id: string;
  label: string;
  min?: number;
  max?: number;
}[] = [
  { id: "under-25", label: "Under $25", max: 24.99 },
  { id: "25-50", label: "$25 to $50", min: 25, max: 49.99 },
  { id: "50-100", label: "$50 to $100", min: 50, max: 99.99 },
  { id: "over-100", label: "$100 and over", min: 100 },
];

function isProductSort(value: string | null): value is ProductSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function parseNumber(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function parseFilters(params: URLSearchParams): ProductFilterState {
  const sort = params.get("sort");
  return {
    search: params.get("q")?.trim() ?? "",
    category: params.get("category") ?? "",
    minPrice: parseNumber(params.get("min")),
    maxPrice: parseNumber(params.get("max")),
    inStock: params.get("stock") === "1",
    sort: isProductSort(sort) ? sort : "featured",
    page: parsePage(params.get("page")),
  };
}

/** Only non-default values go in the URL, so /shop stays clean. */
export function serializeFilters(filters: ProductFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.minPrice !== undefined)
    params.set("min", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("max", String(filters.maxPrice));
  if (filters.inStock) params.set("stock", "1");
  if (filters.sort !== "featured") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

/** Converts the UI state into the parameters the service (and later the API) takes. */
export function toProductQuery(filters: ProductFilterState): ProductQuery {
  return {
    search: filters.search || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock || undefined,
    sort: filters.sort,
    page: filters.page,
  };
}

/** The preset matching the current min/max, or undefined. */
export function getActivePriceRange(filters: ProductFilterState) {
  return PRICE_RANGES.find(
    (range) => range.min === filters.minPrice && range.max === filters.maxPrice,
  );
}
