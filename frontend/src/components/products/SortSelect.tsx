import { Select } from "@/components/ui/select"
import { SORT_OPTIONS } from "@/lib/catalog"
import type { ProductSort } from "@/types/catalog"

interface SortSelectProps {
  value: ProductSort
  onChange: (value: ProductSort) => void
  className?: string
}

export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <div className={className}>
      <Select
        aria-label="Sort products"
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="h-11"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
