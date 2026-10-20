import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// eslint-disable-next-line react-refresh/only-export-components
export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        primary: "bg-accent text-accent-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        info: "bg-info-soft text-info",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border text-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
