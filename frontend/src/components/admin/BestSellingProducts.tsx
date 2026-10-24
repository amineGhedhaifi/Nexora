import { Package } from "lucide-react";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency } from "@/lib/format";

interface BestSellingProductsProps {
  /** Best-selling products, most sold first. Only the top 5 are shown. */
  products: readonly object[];
}

type Row = Record<string, unknown>;

// The API's exact field names aren't known here, so each value is looked up
// under the most common names. Add yours to these lists if something is blank.
const ID_KEYS = ["id", "productId"];
const NAME_KEYS = ["name", "productName", "title"];
const IMAGE_KEYS = ["imageUrl", "image", "thumbnail"];
const SOLD_KEYS = [
  "totalSold",
  "sold",
  "quantitySold",
  "totalQuantity",
  "unitsSold",
  "salesCount",
  "quantity",
  "count",
];
const REVENUE_KEYS = ["revenue", "totalRevenue", "total", "sales"];

const TOP_COUNT = 5;

function pick(row: Row, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] != null) return row[key];
  }
  return undefined;
}

function normalize(item: object, index: number) {
  const row = item as Row;
  // Some APIs nest the product: { product: { name, imageUrl }, totalSold }
  const nested =
    typeof row.product === "object" && row.product !== null
      ? (row.product as Row)
      : {};
  const merged: Row = { ...row, ...nested };

  const sold = pick(row, SOLD_KEYS) ?? pick(merged, SOLD_KEYS);
  const revenue = pick(row, REVENUE_KEYS);

  return {
    id: String(pick(merged, ID_KEYS) ?? index),
    name: String(pick(merged, NAME_KEYS) ?? "Unnamed product"),
    imageUrl: pick(merged, IMAGE_KEYS) as string | undefined,
    sold: sold == null ? null : Number(sold),
    revenue: revenue == null ? null : Number(revenue),
  };
}

export function BestSellingProducts({ products }: BestSellingProductsProps) {
  const top = products.slice(0, TOP_COUNT).map(normalize);

  return (
    <div className="h-full min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="truncate text-lg font-semibold">
          Best Selling Products
        </h2>
        <p className="text-sm text-muted-foreground">
          Top {TOP_COUNT} products by units sold
        </p>
      </div>

      {top.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package
            className="size-12 text-muted-foreground/50"
            aria-hidden="true"
          />
          <h3 className="mt-4 text-lg font-medium">No sales yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your top sellers will show up here
          </p>
        </div>
      ) : (
        <ol className="mt-4 space-y-3 sm:space-y-4">
          {top.map((product, index) => (
            <li key={product.id} className="flex items-center gap-3 sm:gap-4">
              {/* Rank matters here: the list is ordered by sales */}
              <span
                className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-xs font-semibold text-accent-foreground sm:size-8 sm:text-sm"
                aria-label={`Rank ${index + 1}`}
              >
                {index + 1}
              </span>

              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="size-12 shrink-0 rounded-lg object-cover sm:size-14"
                fallback={
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted sm:size-14">
                    <Package
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                }
              />

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 break-words text-sm font-medium sm:text-base">
                  {product.name}
                </p>
                {product.sold != null && (
                  <p className="text-xs text-muted-foreground sm:text-sm tabular-nums">
                    {product.sold.toLocaleString()} sold
                  </p>
                )}
              </div>

              {product.revenue != null && (
                <p className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums sm:text-base">
                  {formatCurrency(product.revenue)}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
