import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:px-4 sm:py-2"

const SKELETON_WIDTHS = ["w-24", "w-20", "w-28", "w-16", "w-24", "w-20"]

export function CategoryChips() {
  const { categories, isPending, isError } = useCategories()

  // If categories can't be loaded, skip the row instead of showing a broken one
  if (isError || (!isPending && categories.length === 0)) return null

  return (
    <section id="categories" aria-label="Shop by category" className="scroll-mt-24 border-b">
      <div className="page-container py-5">
        {isPending ? (
          <ul aria-busy="true" className="flex flex-wrap gap-2">
            {SKELETON_WIDTHS.map((width, index) => (
              <li key={index} className={`h-9 animate-pulse rounded-full bg-muted ${width}`} />
            ))}
          </ul>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link to={`/categories/${category.slug}`} className={chipClass}>
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/shop" className={`${chipClass} text-link`}>
                View all
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        )}
      </div>
    </section>
  )
}
