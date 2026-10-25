import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApiService, type OrderConfirmation, type CreateOrderInput } from "@/services/orders-api.service";

export function useCreateOrderApi() {
  const queryClient = useQueryClient();

  return useMutation<OrderConfirmation, Error, CreateOrderInput>({
    mutationFn: ordersApiService.createOrder,
    onSuccess: (order) => {
      queryClient.setQueryData(["orders", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}