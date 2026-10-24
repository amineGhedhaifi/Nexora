import { Check, ClipboardCheck, PackageCheck, Truck, XCircle, type LucideIcon } from "lucide-react"
import { ORDER_STATUSES, getStatusIndex, orderStatusMeta } from "@/lib/orders"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types/order"

const stepIcons: Record<OrderStatus, LucideIcon> = {
  ordered: ClipboardCheck,
  shipping: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
}

type StepState = "complete" | "current" | "upcoming"

/** Ordered → Shipping → Delivered. Vertical on mobile, horizontal from the sm breakpoint. */
export function OrderStatusTracker({ status, className }: { status: OrderStatus; className?: string }) {
  const currentIndex = Math.max(0, getStatusIndex(status))
  const lastIndex = ORDER_STATUSES.length - 1

  return (
    <ol aria-label="Order progress" className={cn("flex flex-col sm:flex-row", className)}>
      {ORDER_STATUSES.map((step, index) => {
        const state: StepState =
          index < currentIndex
            ? "complete"
            : index === currentIndex
              ? status === "delivered"
                ? "complete"
                : "current"
              : "upcoming"
        const Icon = stepIcons[step]
        const meta = orderStatusMeta[step]

        return (
          <li
            key={step}
            aria-current={state === "current" ? "step" : undefined}
            className="relative flex gap-4 pb-8 last:pb-0 sm:flex-1 sm:flex-col sm:items-center sm:gap-3 sm:pb-0 sm:text-center"
          >
            {index < lastIndex && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 transition-colors",
                  "sm:left-1/2 sm:top-5 sm:h-0.5 sm:w-full sm:-translate-y-1/2 sm:translate-x-0",
                  index < currentIndex ? "bg-primary" : "bg-border",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 transition-colors",
                state === "upcoming"
                  ? "border-border bg-background text-muted-foreground"
                  : "border-primary bg-primary text-primary-foreground",
                state === "current" && "ring-4 ring-primary/20",
              )}
            >
              {state === "complete" ? <Check className="size-5" /> : <Icon className="size-5" />}
            </span>

            <div className="pt-1.5 sm:pt-0">
              <p className={cn("text-sm font-semibold", state === "upcoming" && "text-muted-foreground")}>
                {meta.label}
              </p>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
              <span className="sr-only">{state === "complete" ? "Completed" : state === "current" ? "Current step" : "Upcoming"}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}