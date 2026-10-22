import { TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BestSellingProduct } from "@/types/dashboard";

interface BestSellingProductsProps {
  products: BestSellingProduct[];
}

export function BestSellingProducts({ products }: BestSellingProductsProps) {
  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">Best Selling Products</h2>
            <p className="text-sm text-muted-foreground">Top 5 products by units sold</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <TrendingUp className="size-12 mb-2 text-muted-foreground/50" aria-hidden="true" />
            <p className="text-sm">No best-selling products yet</p>
          </div>
        ) : (
          products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={cn(
                  "grid size-7 sm:size-8 place-items-center rounded-lg font-bold text-xs sm:text-sm",
                  index < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="size-12 sm:size-14 rounded-lg object-cover"
                  fallback={<div className="size-12 sm:size-14 rounded-lg bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">No image</span></div>}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{formatCurrency(Number(product.price))}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="font-medium tabular-nums text-sm">{product.unitsSold} sold</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(Number(product.price) * product.unitsSold)}</p>
              </div>
              <div className="flex items-center gap-2 sm:hidden text-right">
                <div>
                  <p className="font-medium tabular-nums text-sm">{product.unitsSold} sold</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(Number(product.price) * product.unitsSold)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}