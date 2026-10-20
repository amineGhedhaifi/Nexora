import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle2, PackageSearch } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrder } from "@/hooks/useOrder";
import { formatDate } from "@/lib/format";
import { orderStatusMeta } from "@/lib/orders";

function OrderSuccessSkeleton() {
  return (
    <section className="page-container py-10 sm:py-14" aria-busy="true">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mx-auto size-16 animate-pulse rounded-full bg-muted" />
        <div className="mx-auto h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    </section>
  );
}

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order, isPending } = useOrder(id);

  if (isPending) return <OrderSuccessSkeleton />;

  if (!order) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't find that order"
          description="Orders are saved on the device you ordered from. If you ordered somewhere else, open the site there."
          action={
            <Link to="/" className={buttonVariants({ size: "lg" })}>
              Back to home
            </Link>
          }
        />
      </section>
    );
  }

  const { shippingInfo } = order;

  return (
    <section className="page-container py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center"
        >
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
            <CheckCircle2 className="size-9" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Thank you, {shippingInfo.firstName}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your order has been placed. We sent the details to{" "}
            {shippingInfo.email}.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-xl border bg-card px-5 py-3 text-sm">
            <span>
              <span className="text-muted-foreground">Order number </span>
              <span className="font-semibold tabular-nums">{order.id}</span>
            </span>
            <span
              className="hidden h-4 w-px bg-border sm:block"
              aria-hidden="true"
            />
            <span className="text-muted-foreground">
              {formatDate(order.createdAt, {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </span>
          </div>
        </motion.div>

        <div className="mt-10 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Order status</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <OrderStatusTracker status={order.status} className="mt-6" />
          <div className="mt-6 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
            <p className="font-semibold">What happens next</p>
            <p className="mt-1">{orderStatusMeta[order.status].nextStep}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section
            aria-labelledby="delivery-heading"
            className="rounded-2xl border bg-card p-6"
          >
            <h2 id="delivery-heading" className="text-lg font-semibold">
              Delivery details
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="mt-0.5 font-medium">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Contact</dt>
                <dd className="mt-0.5 font-medium">{shippingInfo.email}</dd>
                <dd className="font-medium">{shippingInfo.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Shipping address</dt>
                <dd className="mt-0.5 font-medium">{shippingInfo.address}</dd>
                <dd className="font-medium">
                  {shippingInfo.postalCode} {shippingInfo.city}
                </dd>
                <dd className="font-medium">{shippingInfo.country}</dd>
              </div>
            </dl>
          </section>

          <OrderSummary
            items={order.items}
            subtotal={order.subtotal}
            shipping={order.shippingCost}
            total={order.total}
            title="Items ordered"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonVariants({ size: "lg" })}>
            Continue shopping
          </Link>
          <Link
            to="/orders"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            View my orders
          </Link>
        </div>
      </div>
    </section>
  );
}
