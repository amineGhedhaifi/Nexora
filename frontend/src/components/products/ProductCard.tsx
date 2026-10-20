import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CategoryIcon } from "@/components/shared/CategoryIcon"
import { Price } from "@/components/shared/Price"
import { ProductImage } from "@/components/shared/ProductImage"
import { Rating } from "@/components/shared/Rating"
import { getDiscountPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  /** When provided, shows a quick "add to cart" button. */
  onAddToCart?: (product: Product) => void
  className?: string
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const discount = getDiscountPercent(product.price, product.originalPrice)
  const soldOut = product.stock <= 0

  const placeholder = (
    <div className="grid size-full place-items-center bg-linear-to-br from-accent via-muted to-secondary">
      <CategoryIcon slug={product.category?.slug ?? ""} className="size-12 text-primary/40" />
    </div>
  )

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ring",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ProductImage
          src={product.images[0]}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallback={placeholder}
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <Badge className="bg-primary text-primary-foreground shadow-sm">-{discount}%</Badge>}
          {product.isNew && (
            <Badge variant="outline" className="bg-background/90 shadow-sm backdrop-blur">
              New
            </Badge>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Badge variant="outline" className="bg-background px-3 py-1 text-sm">
              Sold out
            </Badge>
          </div>
        )}

        {onAddToCart && !soldOut && (
          <Button
            size="icon"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAddToCart(product)}
            className="absolute bottom-3 right-3 z-10 shadow-md [@media(pointer:fine)]:translate-y-2 [@media(pointer:fine)]:opacity-0 [@media(pointer:fine)]:group-hover:translate-y-0 [@media(pointer:fine)]:group-hover:opacity-100 [@media(pointer:fine)]:focus-visible:translate-y-0 [@media(pointer:fine)]:focus-visible:opacity-100"
          >
            <ShoppingBag />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.category.name}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">
          {/* Stretched link: the whole card is clickable, but it is only one link for screen readers */}
          <Link
            to={`/products/${encodeURIComponent(product.slug)}`}
            className="outline-none transition-colors after:absolute after:inset-0 group-hover:text-link"
          >
            {product.name}
          </Link>
        </h3>
        {product.rating !== undefined && <Rating value={product.rating} count={product.reviewCount} />}
        <Price price={product.price} originalPrice={product.originalPrice} className="mt-auto pt-1" />
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card" aria-hidden="true">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/4 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
