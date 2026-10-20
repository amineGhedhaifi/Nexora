import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  id?: string
  eyebrow?: string
  description?: string
  action?: { label: string; to: string }
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({
  title,
  id,
  eyebrow,
  description,
  action,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center sm:justify-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-link">{eyebrow}</p>}
        <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>

      {action && (
        <Link
          to={action.to}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-link"
        >
          {action.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
