import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { useCart } from "@/hooks/useCart"
import { useRelatedProducts } from "@/hooks/useRelatedProducts"
import { toCartProduct } from "@/lib/cart"
import type { Product } from "@/types/product"

const COUNT = 4

export function RelatedProducts({ product }: { product: Product }) {
  const { data: related, isPending, isError } = useRelatedProducts(product, COUNT)
  const { addItem } = useCart()

  // This section is a bonus: if it fails or is empty, simply don't show it
  if (isError || (!isPending && (!related || related.length === 0))) return null

  return (
    <section aria-labelledby="related-heading" className="section-y border-t bg-surface">
      <div className="page-container">
        <SectionHeading
          id="related-heading"
          eyebrow="Keep exploring"
          title="You may also like"
          action={{ label: "View all products", to: "/shop" }}
        />
        <ul aria-busy={isPending} className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: COUNT }).map((_, i) => (
                <li key={i}>
                  <ProductCardSkeleton />
                </li>
              ))
            : related?.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} onAddToCart={(p) => addItem(toCartProduct(p))} />
                </li>
              ))}
        </ul>
      </div>
    </section>
  )
}
