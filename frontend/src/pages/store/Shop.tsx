import { useRef, useState } from "react";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Pagination } from "@/components/ui/pagination";
import { ActiveFilters } from "@/components/products/ActiveFilters";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductSearch } from "@/components/products/ProductSearch";
import { SortSelect } from "@/components/products/SortSelect";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCart } from "@/hooks/useCart";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useProducts } from "@/hooks/useProducts";
import { toCartProduct } from "@/lib/cart";
import { toProductQuery } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const gridClass =
  "grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 2xl:grid-cols-4";

export default function Shop() {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { addItem } = useCart();
  const {
    filters,
    updateFilters,
    clearFilters,
    activeCount,
    hasActiveFilters,
  } = useProductFilters();
  const { data, isPending, isError, isPlaceholderData, refetch } = useProducts(
    toProductQuery(filters),
  );

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const from = data ? (data.page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.page * data.pageSize, data.total) : 0;

  return (
    <>
      <div className="border-b bg-surface">
        <div className="page-container py-10 sm:py-14">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Shop
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Everything we have in stock, from everyday tech to home essentials.
          </p>
        </div>
      </div>

      <div className="page-container py-8 sm:py-10">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-28">
              <ProductFilters
                filters={filters}
                onChange={updateFilters}
                onClear={clearFilters}
                activeCount={activeCount}
              />
            </div>
          </aside>

          <section
            ref={resultsRef}
            aria-label="Products"
            className="min-w-0 scroll-mt-28 space-y-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ProductSearch
                value={filters.search}
                onChange={(search) =>
                  updateFilters({ search }, { replace: true })
                }
                className="flex-1"
              />
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-11 lg:hidden"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal />
                  Filters{activeCount > 0 && ` (${activeCount})`}
                </Button>
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) => updateFilters({ sort })}
                  className="min-w-0 flex-1 sm:w-52 sm:flex-none"
                />
              </div>
            </div>

            <ActiveFilters
              filters={filters}
              onChange={updateFilters}
              onClear={clearFilters}
            />

            {isError ? (
              <div className="rounded-2xl border border-dashed p-10 text-center">
                <p className="font-medium">We couldn't load the products.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check your connection and try again.
                </p>
                <Button
                  className="mt-5"
                  variant="outline"
                  onClick={() => refetch()}
                >
                  Try again
                </Button>
              </div>
            ) : isPending ? (
              <ul aria-busy="true" className={gridClass}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <li key={i}>
                    <ProductCardSkeleton />
                  </li>
                ))}
              </ul>
            ) : data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed">
                <EmptyState
                  icon={PackageSearch}
                  title={
                    hasActiveFilters
                      ? "No products match your filters"
                      : "No products found"
                  }
                  description={
                    hasActiveFilters
                      ? "Try removing a filter or searching for something else."
                      : "There's nothing here yet. Try again a little later."
                  }
                  action={
                    hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            ) : (
              <>
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  Showing {from}–{to} of {data.total}{" "}
                  {data.total === 1 ? "product" : "products"}
                </p>

                <ul
                  className={cn(
                    gridClass,
                    "transition-opacity",
                    isPlaceholderData && "opacity-60",
                  )}
                >
                  {data.items.map((product) => (
                    <li key={product.id}>
                      <ProductCard
                        product={product}
                        onAddToCart={(item) => addItem(toCartProduct(item))}
                      />
                    </li>
                  ))}
                </ul>

                <div className="pt-6">
                  <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        side="right"
        title="Filters"
        description="Narrow the product list by category, price and availability."
        className="max-w-sm"
      >
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <ProductFilters
            filters={filters}
            onChange={updateFilters}
            onClear={clearFilters}
            activeCount={activeCount}
          />
        </div>
        <div className="border-t p-4">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setFiltersOpen(false)}
          >
            {data
              ? `Show ${data.total} ${data.total === 1 ? "result" : "results"}`
              : "Show results"}
          </Button>
        </div>
      </Drawer>
    </>
  );
}
