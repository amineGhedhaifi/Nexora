import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import type { Order } from "@/types/order";

export function useOrders(page = 1, limit = 10) {
  return useQuery<Order[]>({
    queryKey: ["orders", "list", page, limit],
    queryFn: () => ordersService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // For authenticated users, the service will try API first
    // For guests, it will use localStorage
  });
}
