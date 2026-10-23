import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApiService, type OrderConfirmation } from "@/services/orders-api.service";
import { ordersService } from "@/services/orders.service";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<OrderConfirmation, Error, { orderId: string; trackingToken?: string }>({
    mutationFn: ({ orderId, trackingToken }) => ordersApiService.cancelOrder(orderId, trackingToken),
    onSuccess: (order) => {
      queryClient.setQueryData(["orders", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      ordersService.getById(order.id).then((updatedOrder) => {
        if (updatedOrder) {
          queryClient.setQueryData(["orders", "detail", order.id], updatedOrder);
        }
      });
    },
  });
}