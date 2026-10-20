import { Badge } from "@/components/ui/badge"
import { orderStatusMeta } from "@/lib/orders"
import type { OrderStatus } from "@/types/order"

const variants = {
  ordered: "warning",
  shipping: "info",
  delivered: "success",
} as const

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variants[status]}>{orderStatusMeta[status].label}</Badge>
}
