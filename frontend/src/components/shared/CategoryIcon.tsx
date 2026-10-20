import { Armchair, BookOpen, Dumbbell, Gamepad2, Headphones, HeartPulse, Package, Shirt, Sparkles, Watch } from "lucide-react"

type IconKind = "electronics" | "beauty" | "books" | "clothing" | "home" | "sports" | "toys" | "accessories" | "health"

// Matched against the category slug, so categories added later still get a fitting icon
const keywordKinds: [keyword: string, kind: IconKind][] = [
  ["electronic", "electronics"],
  ["beauty", "beauty"],
  ["book", "books"],
  ["cloth", "clothing"],
  ["fashion", "clothing"],
  ["home", "home"],
  ["kitchen", "home"],
  ["furniture", "home"],
  ["sport", "sports"],
  ["outdoor", "sports"],
  ["fitness", "sports"],
  ["toy", "toys"],
  ["game", "toys"],
  ["accessor", "accessories"],
  ["jewel", "accessories"],
  ["health", "health"],
]

function getIconKind(slug: string): IconKind | null {
  const lower = slug.toLowerCase()
  return keywordKinds.find(([keyword]) => lower.includes(keyword))?.[1] ?? null
}

/**
 * Icon for placeholder tiles. A switch over fixed JSX (not a component picked
 * from a variable) keeps React from treating it as a new component each render.
 */
export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  switch (getIconKind(slug)) {
    case "electronics":
      return <Headphones className={className} aria-hidden="true" />
    case "beauty":
      return <Sparkles className={className} aria-hidden="true" />
    case "books":
      return <BookOpen className={className} aria-hidden="true" />
    case "clothing":
      return <Shirt className={className} aria-hidden="true" />
    case "home":
      return <Armchair className={className} aria-hidden="true" />
    case "sports":
      return <Dumbbell className={className} aria-hidden="true" />
    case "toys":
      return <Gamepad2 className={className} aria-hidden="true" />
    case "accessories":
      return <Watch className={className} aria-hidden="true" />
    case "health":
      return <HeartPulse className={className} aria-hidden="true" />
    default:
      return <Package className={className} aria-hidden="true" />
  }
}
