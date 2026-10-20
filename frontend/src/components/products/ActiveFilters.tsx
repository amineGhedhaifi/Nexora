import { X } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { getActivePriceRange, type ProductFilterState } from "@/lib/catalog"
import { formatPrice } from "@/lib/format"

interface ActiveFiltersProps {
  filters: ProductFilterState
  onChange: (patch: Partial<ProductFilterState>) => void
  onClear: () => void
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <li>
      <span className="inline-flex items-center gap-1 rounded-full border bg-card py-1 pl-3 pr-1 text-sm">
        {label}
        <button
          type="button"
          aria-label={`Remove filter: ${label}`}
          onClick={onRemove}
          className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </span>
    </li>
  )
}

/** Removable chips for every applied filter. Renders nothing when none are applied. */
export function ActiveFilters({ filters, onChange, onClear }: ActiveFiltersProps) {
  const { categories } = useCategories()
  const categoryName = categories.find((category) => category.slug === filters.category)?.name
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined
  const priceLabel =
    getActivePriceRange(filters)?.label ??
    `${filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "$0"} to ${
      filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "any"
    }`

  const hasChips = Boolean(filters.search || filters.category || hasPrice || filters.inStock)
  if (!hasChips) return null

  return (
    <ul aria-label="Applied filters" className="flex flex-wrap items-center gap-2">
      {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => onChange({ search: "" })} />}
      {filters.category && (
        <Chip label={categoryName ?? filters.category} onRemove={() => onChange({ category: "" })} />
      )}
      {hasPrice && <Chip label={priceLabel} onRemove={() => onChange({ minPrice: undefined, maxPrice: undefined })} />}
      {filters.inStock && <Chip label="In stock" onRemove={() => onChange({ inStock: false })} />}
      <li>
        <button type="button" onClick={onClear} className="px-2 text-sm font-medium text-link hover:underline">
          Clear all
        </button>
      </li>
    </ul>
  )
}
