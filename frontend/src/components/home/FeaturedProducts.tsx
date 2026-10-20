import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { ProductCard, ProductCardSkeleton } from "@/components/products/ProductCard"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { useCart } from "@/hooks/useCart"
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts"
import { toCartProduct } from "@/lib/cart"

const COUNT = 4

export function FeaturedProducts() {
  const { data: products, isPending, isError, refetch } = useFeaturedProducts(COUNT)
  const { addItem } = useCart()

  return (
    <section aria-labelledby="featured-heading" className="section-y">
      <div className="page-container">
        <SectionHeading
          id="featured-heading"
          eyebrow="Our products"
          title="Shop our products"
          description="A selection from our catalog."
          action={{ label: "View all products", to: "/shop" }}
        />

        {isError ? (
          <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
            <p className="font-medium">We couldn't load the products.</p>
            <p className="mt-1 text-sm text-muted-foreground">Check your connection and try again.</p>
            <Button className="mt-5" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <ul aria-busy={isPending} className="mt-10 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {isPending
              ? Array.from({ length: COUNT }).map((_, i) => (
                  <li key={i}>
                    <ProductCardSkeleton />
                  </li>
                ))
              : products.map((product, index) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  >
                    <ProductCard product={product} onAddToCart={(item) => addItem(toCartProduct(item))} />
                  </motion.li>
                ))}
          </ul>
        )}
      </div>
    </section>
  )
}
