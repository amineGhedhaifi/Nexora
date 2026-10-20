import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { FreeShippingProgress } from "./FreeShippingProgress"

export function CartSummary() {
  const { subtotal, shipping, total } = useCart()

  return (
    <aside
      aria-labelledby="summary-heading"
      className="space-y-5 rounded-2xl border bg-card p-6 lg:sticky lg:top-28"
    >
      <h2 id="summary-heading" className="text-lg font-semibold">
        Order summary
      </h2>

      <FreeShippingProgress subtotal={subtotal} />

      <dl className="space-y-3 text-sm">
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

      <Link to="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Checkout
        <ArrowRight />
      </Link>

      <p className="text-center text-xs text-muted-foreground">
        No online payment needed. You'll review and place your order on the next step.
      </p>

      <Link to="/shop" className="block text-center text-sm font-medium text-link hover:underline">
        Continue shopping
      </Link>
    </aside>
  )
}
