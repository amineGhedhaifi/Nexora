import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowRight, Sparkles, Star, Truck, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { MovingBorder } from "@/components/ui/moving-border"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { HeroBackground } from "./HeroBackground"
import { HeroCollage } from "./HeroCollage"

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b">
      <HeroBackground />

      <div className="page-container grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:gap-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xl"
        >
          <Badge variant="primary" className="gap-1.5 px-3 py-1">
            <Sparkles className="size-3.5" aria-hidden="true" />
            New season, new arrivals
          </Badge>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Everything you need, <span className="text-link">delivered</span> to your door.
          </h1>

          <p className="mt-5 text-lg text-muted-foreground">
            Electronics, fashion, home essentials and more. Order in minutes, with no account required.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MovingBorder>
              <Link to="/shop" className={buttonVariants({ size: "lg" })}>
                Shop now
                <ArrowRight />
              </Link>
            </MovingBorder>
            <a href="#categories" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Browse categories
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <span>
                <span className="font-semibold text-foreground">4.8</span> from 2,000+ reviews
              </span>
            </div>
            <span className="flex items-center gap-2">
              <Zap className="size-4 text-link" aria-hidden="true" />
              No account needed
            </span>
            <span className="flex items-center gap-2">
              <Truck className="size-4 text-link" aria-hidden="true" />
              Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}
            </span>
          </div>
        </motion.div>

        <HeroCollage />
      </div>
    </section>
  )
}
