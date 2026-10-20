import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const { items, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Find something you'll love."
          action={
            <Link to="/shop" className={buttonVariants({ size: "lg" })}>
              Start shopping
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="page-container py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Your cart
      </h1>
      <p className="mt-1 text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="rounded-2xl border bg-card px-5 lg:col-span-2">
          <ul className="divide-y">
            {items.map((item) => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </ul>
        </div>

        <CartSummary />
      </div>
    </section>
  );
}
