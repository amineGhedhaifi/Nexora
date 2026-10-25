import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";
import type { OrderConfirmation } from "@/services/orders-api.service";
import type { CreateOrderInput, Order } from "@/types/order";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { apiOrder: OrderConfirmation; formData?: CreateOrderInput }>({
    mutationFn: ({ apiOrder, formData }) => ordersService.storeOrder(apiOrder, formData),
    onSuccess: (order) => {
      queryClient.setQueryData(["orders", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
