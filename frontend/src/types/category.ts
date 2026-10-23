/** Matches GET /api/categories (public). */
export interface Category {
  id: string;
  name: string;
  /** URL-friendly identifier, e.g. "beauty-personal-care". */
  slug: string;
  description: string | null;
}

/** Matches GET /api/categories/admin response item. */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
  };
}

/** Response shape for admin categories listing. */
export interface AdminCategoriesResponse {
  categories: AdminCategory[];
}

/** Request payload for creating a category. */
export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
}

/** Request payload for updating a category. */
export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
}
