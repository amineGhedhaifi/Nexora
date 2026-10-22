import { TrendingUp } from "lucide-react";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BestSellingProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  sold: number;
  revenue: number;
}

const mockBestSelling: BestSellingProduct[] = [
  { id: "1", name: "Wireless Noise-Canceling Headphones", image: "/images/headphones.jpg", category: "Electronics", sold: 234, revenue: 23376 },
  { id: "2", name: "Premium Leather Messenger Bag", image: "/images/bag.jpg", category: "Accessories", sold: 189, revenue: 18900 },
  { id: "3", name: "Organic Cotton T-Shirt (3-pack)", image: "/images/tshirt.jpg", category: "Clothing", sold: 156, revenue: 7794 },
  { id: "4", name: "Stainless Steel Water Bottle", image: "/images/bottle.jpg", category: "Home & Kitchen", sold: 142, revenue: 4258 },
  { id: "5", name: "Bluetooth Mechanical Keyboard", image: "/images/keyboard.jpg", category: "Electronics", sold: 128, revenue: 19187 },
];

export function BestSellingProducts() {
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
        {mockBestSelling.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className={cn(
                "grid size-7 sm:size-8 place-items-center rounded-lg font-bold text-xs sm:text-sm",
                index < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <ProductImage
                src={product.image}
                alt={product.name}
                className="size-12 sm:size-14 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.category}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="font-medium tabular-nums text-sm">{product.sold} sold</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
            </div>
            <div className="flex items-center gap-2 sm:hidden text-right">
              <div>
                <p className="font-medium tabular-nums text-sm">{product.sold} sold</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}