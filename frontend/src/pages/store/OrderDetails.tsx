import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { DeliveryDetails } from "@/components/orders/DeliveryDetails";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusCard } from "@/components/orders/OrderStatusCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrder } from "@/hooks/useOrder";
import { formatDate } from "@/lib/format";

function BackLink() {
  return (
    <Link
      to="/orders"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-link"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Back to orders
    </Link>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const { data: order, isPending } = useOrder(id);

  if (isPending) {
    return (
      <section className="page-container py-10 sm:py-14" aria-busy="true">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't find that order"
          description="Orders are saved on the device you ordered from. If you ordered somewhere else, open the site there."
          action={
            <Link to="/orders" className={buttonVariants({ size: "lg" })}>
              Back to orders
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <BackLink />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Order {order.id}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Placed on{" "}
              {formatDate(order.createdAt, {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <OrderStatusCard status={order.status} className="mt-8" />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <DeliveryDetails shippingInfo={order.shippingInfo} />
          <OrderSummary
            items={order.items}
            subtotal={order.subtotal}
            shipping={order.shippingCost}
            total={order.total}
            title="Items ordered"
          />
        </div>
      </div>
    </section>
  );
}
