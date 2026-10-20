import { Link } from "react-router-dom"
import { ShoppingBag } from "lucide-react"
import { Drawer } from "@/components/ui/drawer"
import { buttonVariants } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { useCart } from "@/hooks/useCart"
import { formatPrice } from "@/lib/format"
import { CartItemRow } from "./CartItemRow"
import { FreeShippingProgress } from "./FreeShippingProgress"

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart } = useCart()
  const isEmpty = items.length === 0

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeCart()
      }}
      side="right"
      title={itemCount > 0 ? `Your cart (${itemCount})` : "Your cart"}
      description="Review the items in your cart before checking out."
    >
      {isEmpty ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Find something you'll love."
          className="flex-1"
          action={
            <Link to="/shop" onClick={closeCart} className={buttonVariants({ size: "lg" })}>
              Start shopping
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5">
            <ul className="divide-y">
              {items.map((item) => (
                <CartItemRow key={item.productId} item={item} onNavigate={closeCart} />
              ))}
            </ul>
          </div>

          <div className="space-y-4 border-t px-5 py-5">
            <FreeShippingProgress subtotal={subtotal} />
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping is calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                onClick={closeCart}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                View cart
              </Link>
              <Link to="/checkout" onClick={closeCart} className={buttonVariants({ size: "lg" })}>
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </Drawer>
  )
}
