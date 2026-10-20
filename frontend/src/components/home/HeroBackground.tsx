import { motion, useReducedMotion } from "motion/react"

const GRID_MASK = "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 100%)"

/** Decorative only: a fading dot grid plus two softly drifting glows in the primary color. */
export function HeroBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 text-foreground/15"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: GRID_MASK,
          WebkitMaskImage: GRID_MASK,
        }}
      />

      <motion.div
        className="absolute -right-24 -top-24 size-[30rem] rounded-full bg-primary/20 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-24 size-[24rem] rounded-full bg-primary/10 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}
