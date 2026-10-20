import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { ProductQuery } from "@/types/catalog";

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ["products", "list", query],
    queryFn: () => productsService.getProducts(query),
    // Keep showing the current page while the next one loads (no skeleton flash)
    placeholderData: keepPreviousData,
  });
}
