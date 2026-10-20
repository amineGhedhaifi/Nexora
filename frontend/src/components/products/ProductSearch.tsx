import { useEffect, useRef, useState, type FormEvent } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ProductSearchProps {
  /** The committed search term (from the URL). */
  value: string
  onChange: (value: string) => void
  className?: string
}

const DEBOUNCE_MS = 400

/** Typing updates the results after a short pause; Enter applies immediately. */
export function ProductSearch({ value, onChange, className }: ProductSearchProps) {
  const [text, setText] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // When the URL changes from elsewhere (e.g. "Clear filters"), follow it
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  const commit = (next: string) => {
    clearTimeout(timer.current)
    onChange(next.trim())
  }

  const handleChange = (next: string) => {
    setText(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onChange(next.trim()), DEBOUNCE_MS)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    commit(text)
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search products..."
        aria-label="Search products"
        className="h-11 pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setText("")
            commit("")
          }}
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
