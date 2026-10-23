import type { OrderStatus } from "@/types/order";

/** The lifecycle, in order. */
export const ORDER_STATUSES: OrderStatus[] = [
  "ordered",
  "shipping",
  "delivered",
  "cancelled",
];

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; description: string; nextStep: string }
> = {
  ordered: {
    label: "Ordered",
    description: "We've received your order.",
    nextStep:
      "We're preparing your items for dispatch. The status will change to Shipping as soon as your order is on its way.",
  },
  shipping: {
    label: "Shipping",
    description: "Your order is on its way.",
    nextStep:
      "Your package is on its way to you. The status will change to Delivered when it arrives.",
  },
  delivered: {
    label: "Delivered",
    description: "Your order has arrived.",
    nextStep: "Your order has been delivered. We hope you enjoy it!",
  },
  cancelled: {
    label: "Cancelled",
    description: "Your order has been cancelled.",
    nextStep: "Your order has been cancelled. The items have been returned to stock.",
  },
};

export function getStatusIndex(status: OrderStatus): number {
  return ORDER_STATUSES.indexOf(status);
}
