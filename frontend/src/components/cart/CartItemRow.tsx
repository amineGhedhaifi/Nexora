import { Link } from "react-router-dom"
import { Package, Trash2 } from "lucide-react"
import { QuantitySelector } from "@/components/products/QuantitySelector"
import { ProductImage } from "@/components/shared/ProductImage"
import { useCart } from "@/hooks/useCart"
import { getMaxQuantity } from "@/lib/cart"
import { formatPrice } from "@/lib/format"
import type { CartItem } from "@/types/cart"

export function CartItemRow({ item, onNavigate }: { item: CartItem; onNavigate?: () => void }) {
  const { updateQuantity, removeItem } = useCart()
  const productPath = `/products/${encodeURIComponent(item.slug)}`

  return (
    <li className="flex gap-4 py-4">
      <Link
        to={productPath}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted"
      >
        <ProductImage
          src={item.image}
          className="size-full object-cover"
          fallback={
            <span className="grid size-full place-items-center text-muted-foreground">
              <Package className="size-6" />
            </span>
          }
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={productPath}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium transition-colors hover:text-link"
          >
            {item.name}
          </Link>
          <button
            type="button"
            aria-label={`Remove ${item.name} from cart`}
            onClick={() => removeItem(item.productId)}
            className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <QuantitySelector
            size="sm"
            value={item.quantity}
            max={getMaxQuantity(item.stock)}
            label={`Quantity for ${item.name}`}
            onChange={(quantity) => updateQuantity(item.productId, quantity)}
          />
          <p className="text-sm font-semibold tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        </div>
      </div>
    </li>
  )
}
