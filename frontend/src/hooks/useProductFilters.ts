import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DEFAULT_FILTERS,
  parseFilters,
  serializeFilters,
  type ProductFilterState,
} from "@/lib/catalog";

/** Reads and writes the shop filters from the URL (the URL is the single source of truth). */
export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  /** Changing any filter goes back to page 1, unless the patch sets a page. */
  const updateFilters = useCallback(
    (patch: Partial<ProductFilterState>, options?: { replace?: boolean }) => {
      setSearchParams(
        (previous) =>
          serializeFilters({ ...parseFilters(previous), page: 1, ...patch }),
        { replace: options?.replace },
      );
    },
    [setSearchParams],
  );

  /** Clears search, category, price and stock. Keeps the chosen sort order. */
  const clearFilters = useCallback(() => {
    setSearchParams((previous) =>
      serializeFilters({
        ...DEFAULT_FILTERS,
        sort: parseFilters(previous).sort,
      }),
    );
  }, [setSearchParams]);

  const activeCount =
    (filters.category ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStock ? 1 : 0);

  return {
    filters,
    updateFilters,
    clearFilters,
    activeCount,
    hasActiveFilters: activeCount > 0 || filters.search !== "",
  };
}
