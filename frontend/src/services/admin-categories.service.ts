import { apiRequest } from "./api";
import type { AdminCategory, CreateCategoryInput, UpdateCategoryInput } from "@/types/category";

function unwrapCategories(raw: unknown): AdminCategory[] {
  if (raw && typeof raw === "object" && "categories" in raw) {
    const data = (raw as { categories?: unknown }).categories;
    if (Array.isArray(data)) return data;
  }
  return [];
}

export const adminCategoriesService = {
  /** GET /api/categories/admin - requires admin auth. Returns all categories with product counts. */
  async getAdminCategories(): Promise<AdminCategory[]> {
    const response = await apiRequest<unknown>("/categories/admin", {
      auth: true,
    });
    return unwrapCategories(response);
  },

  /** POST /api/categories - requires admin auth. Creates a new category. */
  async createCategory(data: CreateCategoryInput): Promise<AdminCategory> {
    const response = await apiRequest<{ category: AdminCategory }>("/categories", {
      method: "POST",
      body: data,
      auth: true,
    });
    return response.category;
  },

  /** PATCH /api/categories/:id - requires admin auth. Updates a category. */
  async updateCategory(id: string, data: UpdateCategoryInput): Promise<AdminCategory> {
    const response = await apiRequest<{ category: AdminCategory }>(`/categories/${id}`, {
      method: "PATCH",
      body: data,
      auth: true,
    });
    return response.category;
  },

  /** DELETE /api/categories/:id - requires admin auth. Deletes a category. */
  async deleteCategory(id: string): Promise<void> {
    await apiRequest<unknown>(`/categories/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },
};

export type { AdminCategory } from "@/types/category";