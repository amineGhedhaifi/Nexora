import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/products/QuantitySelector"
import { useCart } from "@/hooks/useCart"
import { getMaxQuantity, toCartProduct } from "@/lib/cart"
import type { Product } from "@/types/product"

/** Quantity selector and the add-to-cart button. Opens the cart drawer when added. */
export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart()
  const max = getMaxQuantity(product.stock)
  const [quantity, setQuantity] = useState(1)
  const soldOut = max === 0

  return (
    <div className="space-y-5">
      {!soldOut && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity</span>
          <QuantitySelector value={quantity} max={max} onChange={setQuantity} />
        </div>
      )}

      <Button
        size="lg"
        disabled={soldOut}
        onClick={() => addItem(toCartProduct(product), quantity)}
        className="w-full sm:w-auto sm:min-w-64"
      >
        <ShoppingBag />
        {soldOut ? "Sold out" : "Add to cart"}
      </Button>
    </div>
  )
}
