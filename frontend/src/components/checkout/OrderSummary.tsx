import { Package } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

interface SummaryItem {
  productId: string
  name: string
  price: number
  image: string | null
  quantity: number
}

interface OrderSummaryProps {
  items: SummaryItem[]
  subtotal: number
  shipping: number
  total: number
  title?: string
  className?: string
}

/** Used by the checkout now, and reused on the order confirmation and order details pages. */
export function OrderSummary({ items, subtotal, shipping, total, title = "Order summary", className }: OrderSummaryProps) {
  return (
    <section aria-label={title} className={cn("rounded-2xl border bg-card p-6", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>

      <ul className="mt-5 divide-y">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
            <div className="relative size-14 shrink-0">
              <div className="size-full overflow-hidden rounded-lg border bg-muted">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-muted-foreground">
                    <Package className="size-5" />
                  </span>
                )}
              </div>
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-bold leading-5 text-background"
              >
                {item.quantity}
              </span>
            </div>
            <p className="min-w-0 flex-1 text-sm font-medium">
              <span className="line-clamp-2">{item.name}</span>
              <span className="sr-only">, quantity {item.quantity}</span>
            </p>
            <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="font-medium tabular-nums">
            {shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-bold tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>
    </section>
  )
}
