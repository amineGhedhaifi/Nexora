import type { Category } from "@/types/category";
import { apiRequest } from "./api";

// This endpoint returns { categories: [...] } directly (no { status, data } wrapper)
interface CategoriesResponse {
  categories?: Category[];
}

export const categoriesService = {
  /** GET /api/categories (public), sorted by name. */
  async getAll(): Promise<Category[]> {
    const response = await apiRequest<CategoriesResponse>("/categories");
    return Array.isArray(response.categories) ? response.categories : [];
  },
};
