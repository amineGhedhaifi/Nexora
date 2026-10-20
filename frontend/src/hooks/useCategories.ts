import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import type { Category } from "@/types/category";

// A stable empty array, so components don't re-render because of a new [] each time
const NO_CATEGORIES: Category[] = [];

/**
 * Categories from the API. Many components call this; TanStack Query fetches
 * once and shares the result. While loading (or after an error) `categories`
 * is an empty array, so callers can keep using it without null checks.
 */
export function useCategories() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60_000, // categories rarely change
  });

  return {
    categories: query.data ?? NO_CATEGORIES,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  };
}
