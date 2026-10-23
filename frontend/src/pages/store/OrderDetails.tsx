import { Link, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, PackageSearch, Key, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { DeliveryDetails } from "@/components/orders/DeliveryDetails";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderStatusCard } from "@/components/orders/OrderStatusCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { useOrder } from "@/hooks/useOrder";
import { formatDate } from "@/lib/format";
import { useCancelOrder } from "@/hooks/useCancelOrder";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";
import { ordersService } from "@/services/orders.service";

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

function TrackingTokenForm({ onSubmit }: { onSubmit: (token: string) => void }) {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onSubmit(token.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="tracking-token" className="block text-sm font-medium">
          Tracking Token
        </label>
        <div className="flex gap-2">
          <Input
            id="tracking-token"
            type="text"
            placeholder="Enter your tracking token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="flex-1 font-mono text-sm"
            autoComplete="off"
          />
          <button type="submit" disabled={!token.trim()} className={buttonVariants({ size: "default" })}>
            <Key className="size-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          You received this token when you placed your order as a guest.
        </p>
      </div>
    </form>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { data: order, isPending, isError } = useOrder(id);
  const { isAuthenticated } = useAuth()
  const cancelOrder = useCancelOrder()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const canCancel = order?.status === "ordered"

  const handleCancel = async () => {
    try {
      const trackingToken = isAuthenticated ? undefined : ordersService.getTrackingToken(order!.id)
      await cancelOrder.mutateAsync({ orderId: order!.id, trackingToken })
    } catch (error) {
      console.error("Failed to cancel order:", error)
    } finally {
      setShowCancelDialog(false)
    }
  }

  const handleTrackingTokenSubmit = (token: string) => {
    setSearchParams({ trackingToken: token }, { replace: true });
  };

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
      <section className="page-container py-10 sm:py-14">
        <div className="mx-auto max-w-md">
          <EmptyState
            icon={PackageSearch}
            title="We couldn't find that order"
            description={isError
              ? "You don't have access to this order. If you placed this order as a guest, enter your tracking token below."
              : "Orders are saved on the device you ordered from. If you placed this order as a guest on another device, enter your tracking token below."}
            action={
              <TrackingTokenForm orderId={id as string} onSubmit={handleTrackingTokenSubmit} />
            }
          />
        </div>
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
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {canCancel && (
              <>
                <button
                  type="button"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                  disabled={cancelOrder.isPending}
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="size-4 mr-1" aria-hidden="true" />
                  Cancel order
                </button>
                <ConfirmDialog
                  open={showCancelDialog}
                  onClose={() => setShowCancelDialog(false)}
                  onConfirm={handleCancel}
                  title="Cancel order?"
                  description={`Are you sure you want to cancel order {order.id}? This action cannot be undone.`}
                  confirmText="Yes, cancel order"
                  cancelText="Keep order"
                  variant="destructive"
                  disabled={cancelOrder.isPending}
                />
              </>
            )}
          </div>
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
