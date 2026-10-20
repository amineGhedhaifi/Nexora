import { useQuery } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersService.getAll(),
  });
}
