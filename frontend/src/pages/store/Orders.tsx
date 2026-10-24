import { Link } from "react-router-dom";
import { PackageOpen, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";

export default function Orders() {
  const { data: orders = [], isPending } = useOrders();
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
                  <OrderCard order={order} isStale={!isAuthenticated} />
                </li>
              ))}
            </ul>
            {!isAuthenticated && (
              <div className="mt-6 rounded-xl bg-accent/50 p-4 text-sm text-accent-foreground">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-medium">Orders are saved on this device.</p>
                    <p className="mt-1">Statuses shown here may be outdated. Tap an order to see the latest status.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}