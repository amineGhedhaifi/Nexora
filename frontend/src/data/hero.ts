import { Coffee, Headphones, Shirt, type LucideIcon } from "lucide-react"

export interface HeroTile {
  id: string
  name: string
  category: string
  price: number
  badge?: string
  /**
   * Path to a photo in /public, e.g. "/images/hero/headphones.webp".
   * Leave as null to show a neutral placeholder tile.
   */
  image: string | null
  icon: LucideIcon
  to: string
}

// The first tile is the large one. Links point to the shop for now and
// become real product links once the product pages exist.
export const heroTiles: HeroTile[] = [
  {
    id: "hero-main",
    name: "Studio Wireless Headphones",
    category: "Electronics",
    price: 129,
    badge: "Best seller",
    image: "/images/hero/headphones.webp",
    icon: Headphones,
    to: "/shop",
  },
  {
    id: "hero-second",
    name: "Everyday Linen Shirt",
    category: "Clothing",
    price: 49,
    badge: "New",
    image: "/images/hero/shirt.webp", 
    icon: Shirt,
    to: "/shop",
  },
  {
    id: "hero-third",
    name: "Ceramic Pour-Over Set",
    category: "Home & Living",
    price: 38,
    image: "/images/hero/pour-over.webp",
    icon: Coffee,
    to: "/shop",
  },
]