import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products.service";
import type { Product } from "@/types/product";

export function useRelatedProducts(product: Product, limit = 4) {
  return useQuery({
    queryKey: ["products", "related", product.id, limit],
    queryFn: () => productsService.getRelated(product, limit),
  });
}
