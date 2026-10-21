import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ordersService } from "@/services/orders.service";

export function useOrder(id: string | undefined) {
  const [searchParams] = useSearchParams();
  const trackingToken = searchParams.get("trackingToken") ?? undefined;

  return useQuery({
    queryKey: ["orders", id, trackingToken],
    queryFn: () => ordersService.getById(id as string, trackingToken),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
