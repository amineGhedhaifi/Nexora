import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"

interface PriceProps {
  price: number
  originalPrice?: number
  size?: "md" | "lg"
  className?: string
}

export function Price({ price, originalPrice, size = "md", className }: PriceProps) {
  const hasDiscount = originalPrice !== undefined && originalPrice > price

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-bold tabular-nums",
          size === "lg" ? "text-2xl" : "text-base",
          hasDiscount ? "text-link" : "text-foreground",
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm tabular-nums text-muted-foreground line-through">
          <span className="sr-only">Original price </span>
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  )
}
