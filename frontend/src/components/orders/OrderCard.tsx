import { Link } from "react-router-dom"
import { ArrowRight, Package, XCircle } from "lucide-react"
import { useState } from "react"
import { formatDate, formatPrice } from "@/lib/format"
import type { Order } from "@/types/order"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { useCancelOrder } from "@/hooks/useCancelOrder"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { ordersService } from "@/services/orders.service"

const MAX_PREVIEW = 4

export function OrderCard({ order, isStale = false }: { order: Order; isStale?: boolean }) {
  const unitCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const preview = order.items.slice(0, MAX_PREVIEW)
  const extra = order.items.length - preview.length
  const { isAuthenticated } = useAuth()
  const cancelOrder = useCancelOrder()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const canCancel = order.status === "ordered"

  const handleCancel = async () => {
    try {
      const trackingToken = isAuthenticated ? undefined : ordersService.getTrackingToken(order.id)
      await cancelOrder.mutateAsync({ orderId: order.id, trackingToken })
    } catch {
      // Intentionally empty; errors are silently swallowed in production.
    } finally {
      setShowCancelDialog(false)
    }
  }

  return (
    <article className="group relative rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">
            <Link to={`/orders/${order.id}`} className="outline-none after:absolute after:inset-0 group-hover:text-link">
              Order {order.id}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt, { dateStyle: "medium" })}
          </p>
        </div>
        {!isStale && <OrderStatusBadge status={order.status} />}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <ul className="flex -space-x-2" aria-label="Items in this order">
          {preview.map((item) => (
            <li
              key={item.productId}
              className="size-12 overflow-hidden rounded-lg border-2 border-card bg-muted"
              title={item.name}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-muted-foreground">
                  <Package className="size-5" aria-label={item.name} />
                </span>
              )}
            </li>
          ))}
          {extra > 0 && (
            <li className="grid size-12 place-items-center rounded-lg border-2 border-card bg-muted text-xs font-medium">
              +{extra}
            </li>
          )}
        </ul>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {unitCount} {unitCount === 1 ? "item" : "items"}
          </p>
          <p className="font-bold tabular-nums">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="flex items-center gap-1 text-sm font-medium text-link">
          View details
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </p>

        {canCancel && (
          <>
            <button
              type="button"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              disabled={cancelOrder.isPending}
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="size-4 mr-1" aria-hidden="true" />
              Cancel order
            </button>
            <ConfirmDialog
              open={showCancelDialog}
              onClose={() => setShowCancelDialog(false)}
              onConfirm={handleCancel}
              title="Cancel order?"
              description={`Are you sure you want to cancel order {order.id}? This action cannot be undone.`}
              confirmText="Yes, cancel order"
              cancelText="Keep order"
              variant="destructive"
              disabled={cancelOrder.isPending}
            />
          </>
        )}
      </div>
    </article>
  )
}