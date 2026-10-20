import { useId } from "react"
import { Button } from "@/components/ui/button"
import { useCategories } from "@/hooks/useCategories"
import { PRICE_RANGES, getActivePriceRange, type ProductFilterState } from "@/lib/catalog"
import { cn } from "@/lib/utils"

interface ProductFiltersProps {
  filters: ProductFilterState
  onChange: (patch: Partial<ProductFilterState>) => void
  onClear: () => void
  activeCount: number
}

interface RadioRowProps {
  name: string
  label: string
  checked: boolean
  onChange: () => void
}

function RadioRow({ name, label, checked, onChange }: RadioRowProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent",
        checked && "bg-accent font-medium text-accent-foreground",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="size-4 accent-primary" />
      {label}
    </label>
  )
}

/** Used in the desktop sidebar and inside the mobile filter drawer. */
export function ProductFilters({ filters, onChange, onClear, activeCount }: ProductFiltersProps) {
  const { categories, isPending, isError, refetch } = useCategories()
  // Radios with the same name form one group across the whole page, so each instance needs its own
  const uid = useId()
  const activeRange = getActivePriceRange(filters)
  const customPrice = !activeRange && (filters.minPrice !== undefined || filters.maxPrice !== undefined)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="-mr-3 text-link">
            Clear all
          </Button>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Category</legend>
        <div className="mt-2 space-y-0.5">
          <RadioRow
            name={`${uid}-category`}
            label="All categories"
            checked={filters.category === ""}
            onChange={() => onChange({ category: "" })}
          />

          {isPending &&
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} aria-hidden="true" className="mx-2 my-2.5 h-4 animate-pulse rounded bg-muted" />
            ))}

          {categories.map((category) => (
            <RadioRow
              key={category.id}
              name={`${uid}-category`}
              label={category.name}
              checked={filters.category === category.slug}
              onChange={() => onChange({ category: category.slug })}
            />
          ))}

          {isError && (
            <div className="px-2 py-2 text-sm text-muted-foreground">
              <p>We couldn't load the categories.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-1 font-medium text-link hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Price</legend>
        <div className="mt-2 space-y-0.5">
          <RadioRow
            name={`${uid}-price`}
            label="Any price"
            checked={!activeRange && !customPrice}
            onChange={() => onChange({ minPrice: undefined, maxPrice: undefined })}
          />
          {PRICE_RANGES.map((range) => (
            <RadioRow
              key={range.id}
              name={`${uid}-price`}
              label={range.label}
              checked={activeRange?.id === range.id}
              onChange={() => onChange({ minPrice: range.min, maxPrice: range.max })}
            />
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors hover:bg-accent">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(event) => onChange({ inStock: event.target.checked })}
          className="size-4 accent-primary"
        />
        In stock only
      </label>
    </div>
  )
}
