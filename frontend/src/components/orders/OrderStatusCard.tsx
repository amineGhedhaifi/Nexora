import { orderStatusMeta } from "@/lib/orders"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/order"
import { OrderStatusTracker } from "./OrderStatusTracker"

export function OrderStatusCard({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <section aria-labelledby="progress-heading" className={cn("rounded-2xl border bg-card p-6", className)}>
      <h2 id="progress-heading" className="text-lg font-semibold">
        Order progress
      </h2>
      <OrderStatusTracker status={status} className="mt-6" />
      <div className="mt-6 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
        <p className="font-semibold">What happens next</p>
        <p className="mt-1">{orderStatusMeta[status].nextStep}</p>
      </div>
    </section>
  )
}
