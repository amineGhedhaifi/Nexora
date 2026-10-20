import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";

/** One product by its slug. `data` is null when it doesn't exist; `isError` for other failures. */
export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["products", "detail", slug],
    queryFn: () => productsService.getBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
