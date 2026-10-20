import { motion } from "motion/react"
import { Truck } from "lucide-react"
import { amountToFreeShipping } from "@/lib/cart"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { formatPrice } from "@/lib/format"

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  if (subtotal <= 0) return null

  const remaining = amountToFreeShipping(subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm">
        <Truck className="size-4 shrink-0 text-link" aria-hidden="true" />
        {remaining > 0 ? (
          <span>
            Add <span className="font-semibold">{formatPrice(remaining)}</span> more for free shipping
          </span>
        ) : (
          <span className="font-medium text-success">You've unlocked free shipping</span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
