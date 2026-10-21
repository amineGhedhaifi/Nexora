import { Link } from "react-router-dom";
import { PackageOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";

export default function Orders() {
  const { data: orders, isPending } = useOrders();
  const { isAuthenticated } = useAuth();

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your orders
        </h1>
        <p className="mt-1 text-muted-foreground">
          Follow the status of your orders here. No account needed.
        </p>

        {isPending ? (
          <ul aria-busy="true" className="mt-8 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className="h-44 animate-pulse rounded-2xl border bg-muted"
              />
            ))}
          </ul>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed">
            <EmptyState
              icon={PackageOpen}
              title="No orders yet"
              description="When you place an order, it will show up here so you can follow its status."
              action={
                <Link to="/shop" className={buttonVariants({ size: "lg" })}>
                  Start shopping
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {orders.map((order) => (
                <li key={order.id}>
                  <OrderCard order={order} />
                </li>
              ))}
            </ul>
            {!isAuthenticated && (
              <p className="mt-6 text-xs text-muted-foreground">
                Orders are saved on this device. Clearing your browser data will
                remove them from this list.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
