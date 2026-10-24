import { useState } from "react";
import {
  Truck,
  PackageCheck,
  Clock,
  XCircle,
  User,
  MapPin,
  Phone,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderDetails, AdminOrderStatus } from "@/types/order";
import { ConfirmDialog } from "./ConfirmDialog";

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: AdminOrderDetails | null;
  onStatusUpdate: (
    order: AdminOrderDetails,
    newStatus: AdminOrderStatus,
  ) => void;
  /** True while the parent is applying a status change; disables the action buttons. */
  updating?: boolean;
}

type Tab = "details" | "timeline";

const statusOrder: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const statusConfig: Record<
  AdminOrderStatus,
  {
    variant:
      | "neutral"
      | "primary"
      | "destructive"
      | "success"
      | "warning"
      | "info";
    label: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    variant: "info",
    label: "Pending",
    icon: <Clock className="size-3" />,
  },
  CONFIRMED: {
    variant: "primary",
    label: "Confirmed",
    icon: <PackageCheck className="size-3" />,
  },
  SHIPPED: {
    variant: "warning",
    label: "Shipped",
    icon: <Truck className="size-3" />,
  },
  DELIVERED: {
    variant: "success",
    label: "Delivered",
    icon: <PackageCheck className="size-3" />,
  },
  CANCELLED: {
    variant: "destructive",
    label: "Cancelled",
    icon: <XCircle className="size-3" />,
  },
};

const nextStatus: Record<AdminOrderStatus, AdminOrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const canCancelStatus: Record<AdminOrderStatus, boolean> = {
  PENDING: true,
  CONFIRMED: true,
  SHIPPED: false,
  DELIVERED: false,
  CANCELLED: false,
};

const statusTimeline: { status: AdminOrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "timeline", label: "Timeline" },
];

const sectionTitle =
  "text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3";

export function OrderDetailsDialog({
  open,
  onClose,
  order,
  onStatusUpdate,
  updating = false,
}: OrderDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!order) return null;

  const updatingStatus = updating;

  const handleClose = () => {
    setActiveTab("details"); // reopen on the Details tab next time
    onClose();
  };

  const config = statusConfig[order.status];
  const next = nextStatus[order.status];
  const canCancel = canCancelStatus[order.status];
  const isCancelled = order.status === "CANCELLED";

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  const shipping = Number(order.totalAmount) - subtotal;

  const handleCancel = () => {
    setShowCancelConfirm(false);
    onStatusUpdate(order, "CANCELLED");
  };

  const handleAdvance = () => {
    if (!next) return;
    onStatusUpdate(order, next);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        {/* p-0 / gap-0 so header, scrolling body and footer manage their own spacing */}
        <DialogContent className="flex w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden p-0 max-h-[92dvh] sm:w-full sm:max-w-4xl sm:max-h-[90vh]">
          <DialogHeader className="shrink-0 space-y-1 p-4 pr-12 text-left sm:p-6 sm:pr-14">
            <DialogTitle className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <span className="max-w-full break-all font-mono text-base sm:text-lg">
                {order.id}
              </span>
              <Badge
                variant={config.variant}
                className="shrink-0 gap-1 whitespace-nowrap"
              >
                {config.icon}
                {config.label}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Placed on {formatDate(order.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto border-y">
            <div
              className="sticky top-0 z-20 grid grid-cols-2 border-b bg-background sm:flex sm:gap-4 sm:px-6"
              role="tablist"
              aria-label="Order sections"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`order-tab-${tab.id}`}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`order-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-2",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === "details" && (
                <div
                  role="tabpanel"
                  id="order-panel-details"
                  aria-labelledby="order-tab-details"
                  className="grid gap-6 md:grid-cols-2"
                >
                  <div className="space-y-6">
                    <section>
                      <h3 className={sectionTitle}>Customer Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                            <User className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {order.customerName}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {order.userId
                                ? "Registered Customer"
                                : "Guest Order"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 shrink-0 place-items-center">
                            <Phone
                              className="size-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          {/* Tap-to-call on mobile */}
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="min-w-0 truncate text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {order.customerPhone}
                          </a>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className={sectionTitle}>Shipping Address</h3>
                      <div className="flex items-start gap-3">
                        <div className="grid size-10 shrink-0 place-items-center">
                          <MapPin
                            className="size-5 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                        <address className="min-w-0 self-center whitespace-pre-line break-words text-sm not-italic text-muted-foreground">
                          {order.shippingAddress}
                        </address>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h3 className={sectionTitle}>
                        Order Items ({order.items.length})
                      </h3>
                      <ul className="space-y-3">
                        {order.items.map((item) => (
                          <li
                            key={item.productId}
                            className="flex items-center gap-3 rounded-lg border p-3 sm:gap-4"
                          >
                            <ProductImage
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="size-12 shrink-0 rounded object-cover sm:size-16"
                              fallback={
                                <div className="flex size-12 items-center justify-center rounded bg-muted sm:size-16">
                                  <Package className="size-5 text-muted-foreground sm:size-6" />
                                </div>
                              }
                            />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 break-words text-sm font-medium sm:text-base">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground sm:text-sm">
                                Qty: {item.quantity} ×{" "}
                                {formatCurrency(Number(item.unitPrice))}
                              </p>
                            </div>
                            <p className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums sm:text-base">
                              {formatCurrency(
                                Number(item.unitPrice) * item.quantity,
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="rounded-lg border bg-accent/50 p-4">
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Subtotal</dt>
                          <dd className="tabular-nums">
                            {formatCurrency(subtotal)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted-foreground">Shipping</dt>
                          <dd className="tabular-nums">
                            {formatCurrency(shipping)}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-t pt-2 font-semibold">
                          <dt>Total</dt>
                          <dd className="tabular-nums">
                            {formatCurrency(Number(order.totalAmount))}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <ol
                  role="tabpanel"
                  id="order-panel-timeline"
                  aria-labelledby="order-tab-timeline"
                  className="relative"
                >
                  {statusTimeline.map((step, index) => {
                    const isLast = index === statusTimeline.length - 1;
                    const isCompleted =
                      statusOrder.indexOf(order.status) >=
                      statusOrder.indexOf(step.status);
                    const isCurrent =
                      order.status === step.status &&
                      !isCancelled &&
                      order.status !== "DELIVERED";
                    const stepCancelled =
                      isCancelled && step.status !== "PENDING";
                    const nextCompleted =
                      !isLast &&
                      statusOrder.indexOf(order.status) >=
                        statusOrder.indexOf(statusTimeline[index + 1].status);

                    return (
                      <li
                        key={step.status}
                        className={cn(
                          "relative flex items-start",
                          !isLast && "pb-8",
                        )}
                      >
                        {/* Connector line, centred on the 40px circle */}
                        {!isLast && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2",
                              isCancelled
                                ? "bg-destructive/40"
                                : nextCompleted
                                  ? "bg-primary"
                                  : "bg-muted",
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                            isCompleted
                              ? "border-primary bg-primary"
                              : "border-muted bg-background",
                            isCurrent && "ring-4 ring-primary/20",
                            stepCancelled &&
                              "border-destructive bg-destructive",
                          )}
                        >
                          {isCompleted ? (
                            <PackageCheck
                              className={cn(
                                "size-5",
                                stepCancelled
                                  ? "text-destructive-foreground"
                                  : "text-primary-foreground",
                              )}
                            />
                          ) : (
                            <div className="size-2 rounded-full bg-muted" />
                          )}
                        </div>
                        <div className="ml-3 min-w-0 flex-1 pt-1.5 sm:ml-4">
                          <p
                            className={cn(
                              "font-medium",
                              isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-primary">In progress</p>
                          )}
                          {isCompleted && !isCurrent && !stepCancelled && (
                            <p className="text-sm text-muted-foreground">
                              Completed
                            </p>
                          )}
                          {stepCancelled && (
                            <p className="text-sm text-destructive">
                              Cancelled
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          {/* Footer stays pinned; primary action on top when stacked on mobile */}
          {(canCancel || next) && (
            <DialogFooter className="shrink-0 flex-col-reverse gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:p-6 sm:pb-6">
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={updatingStatus}
                  className="h-11 w-full sm:h-10 sm:w-auto"
                >
                  Cancel Order
                </Button>
              )}
              {next && (
                <Button
                  onClick={handleAdvance}
                  disabled={updatingStatus}
                  className="h-11 w-full sm:ml-auto sm:h-10 sm:w-auto"
                >
                  Mark as {statusConfig[next].label}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Cancel Order?"
        description={`Are you sure you want to cancel order ${order.id}? This will restore stock for all items and cannot be undone.`}
        confirmText="Yes, cancel order"
        cancelText="Keep order"
        variant="destructive"
        disabled={updatingStatus}
      />
    </>
  );
}
