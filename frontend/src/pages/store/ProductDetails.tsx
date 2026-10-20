import { Link, useParams } from "react-router-dom";
import { PackageSearch, RotateCcw, Truck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchase } from "@/components/products/ProductPurchase";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Price } from "@/components/shared/Price";
import { Rating } from "@/components/shared/Rating";
import { useProduct } from "@/hooks/useProduct";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatPrice, getDiscountPercent } from "@/lib/format";

const perks = [
  {
    icon: Truck,
    text: `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`,
  },
  { icon: RotateCcw, text: "30-day returns" },
  { icon: Zap, text: "Order without an account" },
];

function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge variant="destructive">Sold out</Badge>;
  if (stock <= 5)
    return <Badge variant="warning">Only {stock} left in stock</Badge>;
  return <Badge variant="success">In stock</Badge>;
}

function ProductDetailsSkeleton() {
  return (
    <section className="page-container py-6 sm:py-10" aria-busy="true">
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="aspect-square animate-pulse rounded-3xl bg-muted" />
        <div className="space-y-5">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
          <div className="h-12 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </section>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { data: product, isPending, isError, refetch } = useProduct(slug);

  if (isPending) return <ProductDetailsSkeleton />;

  if (isError) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't load this product"
          description="Check your connection and try again."
          action={
            <Button size="lg" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't find that product"
          description="It may have been removed, or the link might be wrong."
          action={
            <Link to="/shop" className={buttonVariants({ size: "lg" })}>
              Back to the shop
            </Link>
          }
        />
      </section>
    );
  }

  const { category } = product;
  const discount = getDiscountPercent(product.price, product.originalPrice);

  return (
    <>
      <section className="page-container py-6 sm:py-10">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: "Shop", to: "/shop" },
            ...(category
              ? [{ label: category.name, to: `/categories/${category.slug}` }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            key={product.id}
            images={product.images}
            name={product.name}
            category={category?.slug ?? ""}
          />

          <div>
            {category && (
              <Link
                to={`/categories/${category.slug}`}
                className="text-sm font-semibold uppercase tracking-wider text-link hover:underline"
              >
                {category.name}
              </Link>
            )}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {product.name}
            </h1>

            {product.rating !== undefined && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Rating value={product.rating} count={product.reviewCount} />
                {product.reviewCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {product.reviewCount} reviews
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Price
                price={product.price}
                originalPrice={product.originalPrice}
                size="lg"
              />
              {discount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  Save {discount}%
                </Badge>
              )}
            </div>

            {product.description && (
              <p className="mt-6 leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="mt-6">
              <StockStatus stock={product.stock} />
            </div>

            <div className="mt-6 border-t pt-6">
              <ProductPurchase key={product.id} product={product} />
            </div>

            <ul className="mt-8 space-y-3 rounded-2xl border bg-card p-5">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <Icon
                    className="size-5 shrink-0 text-link"
                    aria-hidden="true"
                  />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <RelatedProducts key={product.id} product={product} />
    </>
  );
}
