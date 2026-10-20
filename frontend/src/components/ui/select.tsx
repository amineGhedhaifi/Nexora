import { forwardRef, type SelectHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/** Native <select> with Nexora styling: fully accessible and great on mobile. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-9 text-sm shadow-xs",
          "transition-colors focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  ),
)
Select.displayName = "Select"
