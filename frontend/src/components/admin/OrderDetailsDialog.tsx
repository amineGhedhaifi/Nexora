import { useState } from "react";
import { Truck, PackageCheck, Clock, XCircle, User, MapPin, Mail, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminOrderDetails, AdminOrderStatus } from "@/types/order";

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: AdminOrderDetails | null;
  onStatusUpdate: (order: AdminOrderDetails, newStatus: AdminOrderStatus) => void;
}

const statusOrder: AdminOrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusConfig: Record<AdminOrderStatus, { variant: "neutral" | "primary" | "destructive" | "success" | "warning" | "info"; label: string; icon: React.ReactNode }> = {
  PENDING: { variant: "info", label: "Pending", icon: <Clock className="size-3" /> },
  CONFIRMED: { variant: "primary", label: "Confirmed", icon: <PackageCheck className="size-3" /> },
  SHIPPED: { variant: "warning", label: "Shipped", icon: <Truck className="size-3" /> },
  DELIVERED: { variant: "success", label: "Delivered", icon: <PackageCheck className="size-3" /> },
  CANCELLED: { variant: "destructive", label: "Cancelled", icon: <XCircle className="size-3" /> },
};

const nextStatus: Record<AdminOrderStatus, AdminOrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const statusTimeline = [
  { status: "PENDING" as AdminOrderStatus, label: "Order Placed" },
  { status: "CONFIRMED" as AdminOrderStatus, label: "Confirmed" },
  { status: "SHIPPED" as AdminOrderStatus, label: "Shipped" },
  { status: "DELIVERED" as AdminOrderStatus, label: "Delivered" },
];

export function OrderDetailsDialog({ open, onClose, order, onStatusUpdate }: OrderDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"details" | "timeline">("details");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!order) return null;

  const config = statusConfig[order.status];
  const next = nextStatus[order.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] sm:max-h-[90vh]">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="font-mono truncate">{order.id}</span>
              <Badge variant={config.variant} className="gap-1 whitespace-nowrap shrink-0">
                {config.icon}
                {config.label}
              </Badge>
            </DialogTitle>
            <DialogDescription>Placed on {formatDate(order.createdAt)}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="border-y p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-4 border-b pb-4 mb-4 overflow-x-auto" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "details"}
              onClick={() => setActiveTab("details")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Details
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "timeline"}
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0",
                activeTab === "timeline"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Timeline
            </button>
          </div>

          {activeTab === "details" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground shrink-0">
                        <User className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground truncate">{order.userId ? "Registered Customer" : "Guest Order"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-10">
                      <Mail className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
                      <span className="text-sm text-muted-foreground truncate">Phone: {order.customerPhone}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Shipping Address</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="size-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                    <address className="not-italic text-sm text-muted-foreground whitespace-pre-line break-words">{order.shippingAddress}</address>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border">
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="size-14 sm:size-16 rounded object-cover shrink-0"
                          fallback={<div className="size-14 sm:size-16 rounded bg-muted flex items-center justify-center"><Package className="size-6 text-muted-foreground" /></div>}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {formatCurrency(Number(item.unitPrice))}</p>
                        </div>
                        <p className="font-medium tabular-nums whitespace-nowrap shrink-0">{formatCurrency(Number(item.unitPrice) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border p-4 bg-accent/50">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(Number(order.totalAmount) - order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(Number(order.totalAmount))}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="relative pl-4 sm:pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted" />
              {statusTimeline.map((step) => {
                const isCompleted = statusOrder.indexOf(order.status) >= statusOrder.indexOf(step.status);
                const isCurrent = order.status === step.status && order.status !== "CANCELLED" && order.status !== "DELIVERED";
                const isCancelled = order.status === "CANCELLED";
                return (
                  <div key={step.status} className="relative mb-6 flex items-start">
                    <div
                      className={cn(
                        "relative z-10 size-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all",
                        isCompleted ? "bg-primary border-primary" : "bg-background border-muted",
                        isCurrent && "ring-4 ring-primary/20",
                        isCancelled && step.status !== "PENDING" && "bg-destructive border-destructive",
                      )}
                    >
                      {isCompleted ? (
                        <PackageCheck className={cn("size-5", isCancelled ? "text-destructive-foreground" : "text-primary-foreground")} />
                      ) : (
                        <div className="size-2 rounded-full bg-muted" />
                      )}
                    </div>
                    <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                      <p className={cn("font-medium", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                      {isCurrent && <p className="text-sm text-primary">In progress</p>}
                      {isCompleted && !isCurrent && <p className="text-sm text-muted-foreground">Completed</p>}
                      {isCancelled && step.status !== "PENDING" && <p className="text-sm text-destructive">Cancelled</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
          {next && (
            <Button
              onClick={() => {
                setUpdatingStatus(true);
                onStatusUpdate(order, next);
              }}
              disabled={updatingStatus}
              className="w-full sm:w-auto ml-0 sm:ml-auto"
            >
              Mark as {statusConfig[next].label}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}