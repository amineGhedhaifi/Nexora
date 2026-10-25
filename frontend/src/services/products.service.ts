import { resolveImageUrl } from "@/lib/image-url";
import type { PaginatedResponse } from "@/types/api";
import type { ProductQuery } from "@/types/catalog";
import type { Product } from "@/types/product";
import { ApiError, apiRequest, toApiError, tokenStore, refreshSession } from "./api";

/**
 * Products from the Express API (public endpoints, no token).
 *   GET /api/products?page=&limit=&category=   list (only these three parameters exist)
 *   GET /api/products/:slug                    one product
 *
 * The API can't search, sort, or filter by price or stock yet. When the shop
 * uses one of those, this file loads the catalog (the API's maximum is 100
 * products per request) and applies them locally. When the API gains those
 * parameters, delete `processLocally` and pass them through instead.
 */

export const DEFAULT_PAGE_SIZE = 8;
const API_MAX_LIMIT = 100;
const NEW_PRODUCT_DAYS = 30;

// ---- What the API returns -------------------------------------------------

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  /** Prisma Decimal arrives as a string, e.g. "79.99". */
  price: string | number;
  stock: number;
  imageUrl?: string | null;
  category?: { id: string; name: string; slug: string } | null;
  createdAt?: string;
}

interface ApiPagination {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ApiProductList {
  products?: ApiProduct[];
  pagination?: ApiPagination;
}

/** Accepts both { products } and { data: { products } }. */
function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in raw) {
    const data = (raw as { data?: unknown }).data;
    if (data && typeof data === "object") return data as T;
  }
  return raw as T;
}

function toProduct(api: ApiProduct): Product {
  const price = Number(api.price);
  const createdAt = api.createdAt ?? "";
  const age = createdAt
    ? Date.now() - new Date(createdAt).getTime()
    : Number.POSITIVE_INFINITY;
  const image = resolveImageUrl(api.imageUrl);

  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    description: api.description ?? "",
    price: Number.isFinite(price) ? price : 0,
    stock: api.stock,
    images: image ? [image] : [],
    category: api.category
      ? {
          id: api.category.id,
          name: api.category.name,
          slug: api.category.slug,
          description: "",
        }
      : null,
    createdAt,
    isNew: age >= 0 && age < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000,
    featured: false,
    isBestSeller: false,
  };
}

// ---- Requests --------------------------------------------------------------

async function fetchProductList(params: {
  page: number;
  limit: number;
  category?: string;
}) {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.category) search.set("category", params.category);

  const raw = await apiRequest<unknown>(`/products?${search.toString()}`);
  const payload = unwrap<ApiProductList>(raw);

  return {
    items: Array.isArray(payload.products)
      ? payload.products.map(toProduct)
      : [],
    pagination: payload.pagination,
  };
}

// ---- Local processing (only for what the API can't do yet) -----------------

function needsLocalProcessing(query: ProductQuery): boolean {
  return (
    Boolean(query.search?.trim()) ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    Boolean(query.inStock) ||
    (query.sort !== undefined && query.sort !== "featured")
  );
}

function processLocally(
  all: Product[],
  query: ProductQuery,
  page: number,
  pageSize: number,
): PaginatedResponse<Product> {
  const term = query.search?.trim().toLowerCase();

  const filtered = all.filter((product) => {
    if (query.minPrice !== undefined && product.price < query.minPrice)
      return false;
    if (query.maxPrice !== undefined && product.price > query.maxPrice)
      return false;
    if (query.inStock && product.stock <= 0) return false;
    if (term) {
      const haystack =
        `${product.name} ${product.description} ${product.category?.name ?? ""}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  if (query.sort === "newest") {
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (query.sort === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (query.sort === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

// ---- Public service ----------------------------------------------------------

export const productsService = {
  /** The API has no "featured" flag yet, so this is simply the first products. */
  async getFeatured(limit = 4): Promise<Product[]> {
    const { items } = await fetchProductList({ page: 1, limit });
    return items;
  },

  async getProducts(
    query: ProductQuery = {},
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, category } = query;

    if (!needsLocalProcessing(query)) {
      // Plain browsing: the server does the pagination
      const { items, pagination } = await fetchProductList({
        page,
        limit: pageSize,
        category,
      });
      const total = pagination?.total ?? items.length;
      const size = pagination?.limit ?? pageSize;
      return {
        items,
        total,
        page: pagination?.page ?? page,
        pageSize: size,
        totalPages:
          pagination?.totalPages ?? Math.max(1, Math.ceil(total / size)),
      };
    }

    // Search, price, stock, or sort: load the catalog and do it here
    const { items } = await fetchProductList({
      page: 1,
      limit: API_MAX_LIMIT,
      category,
    });
    return processLocally(items, query, page, pageSize);
  },

  /** Returns null when the product doesn't exist (404). Other errors are thrown. */
  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const raw = await apiRequest<unknown>(
        `/products/${encodeURIComponent(slug)}`,
      );
      const { product } = unwrap<{ product?: ApiProduct }>(raw);
      return product ? toProduct(product) : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  /** No related-products endpoint yet: other products from the same category. */
  async getRelated(product: Product, limit = 4): Promise<Product[]> {
    const { items } = await fetchProductList({
      page: 1,
      limit: limit + 1, // one extra, because the current product may be in the list
      category: product.category?.slug,
    });
    return items.filter((item) => item.id !== product.id).slice(0, limit);
  },
};

// ---- Admin product types ----------------------------------------------------

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
}

interface AdminApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string | number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface AdminApiProductList {
  products?: AdminApiProduct[];
  pagination?: ApiPagination;
}

function toAdminProduct(api: AdminApiProduct): AdminProduct {
  const price = Number(api.price);
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    description: api.description,
    price: Number.isFinite(price) ? price : 0,
    stock: api.stock,
    imageUrl: resolveImageUrl(api.imageUrl),
    isActive: api.isActive,
    categoryId: api.category.id,
    categoryName: api.category.name,
    categorySlug: api.category.slug,
    createdAt: api.createdAt,
  };
}

// ---- Admin requests ---------------------------------------------------------

async function fetchAdminProductList(params: {
  page: number;
  limit: number;
  category?: string;
}): Promise<{ items: AdminProduct[]; pagination?: ApiPagination }> {
  const search = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  if (params.category) search.set("category", params.category);

  const raw = await apiRequest<unknown>(`/products/admin?${search.toString()}`, {
    auth: true,
  });
  const payload = unwrap<AdminApiProductList>(raw);

  return {
    items: Array.isArray(payload.products)
      ? payload.products.map(toAdminProduct)
      : [],
    pagination: payload.pagination,
  };
}

/** Sends a multipart/form-data request for create/update product. */
async function sendProductFormData(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH",
): Promise<AdminApiProduct> {
  const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  const apiOrigin = baseUrl.replace(/\/+$/, "").replace(/\/api$/, "");
  const url = `${apiOrigin}/api${path}`;

  const token = tokenStore.get();
  
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401) {
    const session = await refreshSession();
    if (!session) throw new ApiError("Your session has expired. Please sign in again.", 401);
    
    const retryResponse = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: formData,
    });
    
    if (!retryResponse.ok) {
      const error = await toApiError(retryResponse);
      throw error;
    }
    
    const body = await retryResponse.json().catch(() => ({})) as { product?: AdminApiProduct };
    if (!body.product) throw new ApiError("Unexpected response from server.", 500);
    return body.product;
  }

  if (!response.ok) {
    const error = await toApiError(response);
    throw error;
  }

  const body = await response.json().catch(() => ({})) as { product?: AdminApiProduct };
  if (!body.product) throw new ApiError("Unexpected response from server.", 500);
  return body.product;
}

// ---- Admin service ----------------------------------------------------------

export const adminProductsService = {
  /** GET /api/products/admin - requires admin auth. Returns active and inactive products. */
  async getProducts(params: {
    page: number;
    limit: number;
    category?: string;
  }): Promise<PaginatedResponse<AdminProduct>> {
    const { items, pagination } = await fetchAdminProductList(params);
    const total = pagination?.total ?? items.length;
    const size = pagination?.limit ?? params.limit;
    return {
      items,
      total,
      page: pagination?.page ?? params.page,
      pageSize: size,
      totalPages: pagination?.totalPages ?? Math.max(1, Math.ceil(total / size)),
    };
  },

  /** POST /api/products - requires admin auth. Accepts multipart/form-data. */
  async createProduct(formData: FormData): Promise<AdminProduct> {
    const apiProduct = await sendProductFormData("/products", formData, "POST");
    return toAdminProduct(apiProduct);
  },

  /** PATCH /api/products/:id - requires admin auth. Accepts multipart/form-data. */
  async updateProduct(id: string, formData: FormData): Promise<AdminProduct> {
    const apiProduct = await sendProductFormData(`/products/${id}`, formData, "PATCH");
    return toAdminProduct(apiProduct);
  },

  /** DELETE /api/products/:id - requires admin auth. */
  async deleteProduct(id: string): Promise<void> {
    await apiRequest<unknown>(`/products/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};
