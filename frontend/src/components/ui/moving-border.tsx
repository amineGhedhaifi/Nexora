import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

interface MovingBorderProps {
  children: ReactNode
  className?: string
  /** Seconds for one full lap of the highlight. */
  duration?: number
}

/**
 * A highlight that travels around the border of whatever it wraps.
 * Inspired by Aceternity UI's Moving Border / Hover Border Gradient,
 * rebuilt with Nexora's tokens. Use it on one hero-level CTA only.
 */
export function MovingBorder({ children, className, duration = 4 }: MovingBorderProps) {
  const reduceMotion = useReducedMotion()

  return (
    <span
      className={cn(
        "relative inline-flex overflow-hidden rounded-[calc(var(--radius-lg)+2px)] bg-primary/20 p-[2px]",
        className,
      )}
    >
      <motion.span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_60%,var(--primary)_85%,transparent_100%)]"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative inline-flex rounded-lg bg-background">{children}</span>
    </span>
  )
}
