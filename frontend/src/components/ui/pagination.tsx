import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = number | "ellipsis"

/** 1 … 4 5 6 … 12  (never more than 7 slots). */
function getPageItems(page: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  const items: PageItem[] = []
  pages.forEach((p, index) => {
    const previous = pages[index - 1]
    if (previous !== undefined) {
      if (p - previous === 2) items.push(previous + 1)
      else if (p - previous > 2) items.push("ellipsis")
    }
    items.push(p)
  })
  return items
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft />
      </Button>

      <ul className="flex items-center gap-1.5">
        {getPageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${index}`} aria-hidden="true" className="grid size-10 place-items-center text-muted-foreground">
              …
            </li>
          ) : (
            <li key={item}>
              <Button
                variant={item === page ? "primary" : "outline"}
                size="icon"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            </li>
          ),
        )}
      </ul>

      <Button
        variant="outline"
        size="icon"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
