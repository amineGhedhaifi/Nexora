import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max: number
  min?: number
  size?: "sm" | "md"
  label?: string
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  max,
  min = 1,
  size = "md",
  label = "Quantity",
  className,
}: QuantitySelectorProps) {
  const buttonSize = size === "sm" ? "size-7" : "size-9"
  const buttonClass = cn(
    buttonSize,
    "grid place-items-center text-muted-foreground transition-colors",
    "hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
  )

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center overflow-hidden rounded-lg border bg-background", className)}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={buttonClass}
      >
        <Minus className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-8 px-1 text-center text-sm font-medium tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={buttonClass}
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
