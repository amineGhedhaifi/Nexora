import { Star } from "lucide-react"
import { formatCompactNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

interface RatingProps {
  /** 0 to 5 */
  value: number
  count?: number
  className?: string
}

export function Rating({ value, count, className }: RatingProps) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100))
  const label = `Rated ${value.toFixed(1)} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`

  return (
    <div role="img" aria-label={label} className={cn("flex items-center gap-1.5", className)}>
      <div className="relative inline-flex" aria-hidden="true">
        <div className="flex text-muted-foreground/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 shrink-0 fill-current" />
          ))}
        </div>
        <div className="absolute inset-y-0 left-0 flex overflow-hidden text-primary" style={{ width: `${percent}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 shrink-0 fill-current" />
          ))}
        </div>
      </div>
      <span className="text-xs text-muted-foreground" aria-hidden="true">
        {value.toFixed(1)}
        {count !== undefined && ` (${formatCompactNumber(count)})`}
      </span>
    </div>
  )
}
