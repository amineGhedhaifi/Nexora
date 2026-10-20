import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders.service";

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersService.create,
    onSuccess: (order) => {
      queryClient.setQueryData(["orders", order.id], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
