import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";

export function useFeaturedProducts(limit = 4) {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => productsService.getFeatured(limit),
  });
}
