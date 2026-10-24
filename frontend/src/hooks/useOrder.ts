import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/hooks/useAuth";

export function useOrder(id: string | undefined) {
  const [searchParams] = useSearchParams();
  const urlTrackingToken = searchParams.get("trackingToken") ?? undefined;
  const { isAuthenticated } = useAuth();

  const storedTrackingToken = id ? ordersService.getTrackingToken(id) : undefined;
  const trackingToken = urlTrackingToken ?? storedTrackingToken;
  const hasTrackingToken = Boolean(trackingToken);
  const isGuestOrder = !isAuthenticated && hasTrackingToken;

  return useQuery({
    queryKey: ["orders", "detail", id, isGuestOrder ? "guest" : "auth"],
    queryFn: () => ordersService.getById(id as string, trackingToken),
    enabled: Boolean(id),
    staleTime: isGuestOrder ? 30_000 : 5 * 60 * 1000,
    refetchOnMount: isGuestOrder ? "always" : false,
    refetchInterval: isGuestOrder ? 60_000 : false,
    refetchOnWindowFocus: isGuestOrder,
    retry: isGuestOrder ? 3 : 1,
    // Don't return cached data for guest orders without tokens - they must verify via API
    placeholderData: isGuestOrder ? undefined : (previousData) => previousData,
  });
}