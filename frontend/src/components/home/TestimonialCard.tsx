import { Quote, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Testimonial } from "@/types/testimonial"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { name, location, rating, text, product } = testimonial

  return (
    <article className="relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm">
      <Quote className="absolute right-5 top-5 size-8 text-primary/15" aria-hidden="true" />

      <div role="img" aria-label={`Rated ${rating} out of 5`} className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className={cn(
              "size-5",
              i < rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/40",
            )}
          />
        ))}
      </div>

      <h3 className="mt-4 text-lg font-semibold">{name}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{text}</p>

      <div className="mt-6 flex items-center gap-3 border-t pt-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
        >
          {getInitials(name)}
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-medium">Verified buyer · {location}</p>
          {product && <p className="truncate text-muted-foreground">Bought: {product}</p>}
        </div>
      </div>
    </article>
  )
}
