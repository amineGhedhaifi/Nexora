import {
  User,
  Calendar,
  Package,
  DollarSign,
  Mail,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer";
import { adminOrdersService } from "@/services/admin-orders.service";
import type { AdminOrderSummary } from "@/types/order";

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

type Tab = "overview" | "orders";

type OrdersResult = {
  key: string;
  orders: AdminOrderSummary[];
  error: string | null;
};

const tabClass = (active: boolean) =>
  cn(
    "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-2 sm:py-4",
    active
      ? "border-primary text-primary"
      : "border-transparent text-muted-foreground hover:text-foreground",
  );

const columnHeader =
  "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

function getOrderBadgeVariant(status: AdminOrderSummary["status"]) {
  switch (status) {
    case "DELIVERED":
      return "success" as const;
    case "SHIPPED":
      return "warning" as const;
    case "PENDING":
    case "CONFIRMED":
      return "info" as const;
    default:
      return "destructive" as const;
  }
}

function StatCard({
  icon: Icon,
  bgColor,
  textColor,
  label,
  value,
}: {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-xl border bg-card p-3 sm:p-5">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg sm:size-12",
            bgColor,
            textColor,
          )}
        >
          <Icon className="size-5 sm:size-6" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">
          {label}
        </p>
        <p className="mt-1 max-w-full break-words text-lg font-bold tabular-nums sm:text-2xl">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon: Icon,
  isEmail = false,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  isEmail?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-card/50 p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <dt className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </dt>
          <dd className="break-words text-sm font-medium sm:text-base">
            {isEmail ? (
              <a
                href={`mailto:${value}`}
                className="break-all underline-offset-4 hover:underline"
              >
                {value}
              </a>
            ) : (
              value
            )}
          </dd>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({
  loading,
  result,
  onRetry,
}: {
  loading: boolean;
  result: OrdersResult | null;
  onRetry: () => void;
}) {
  if (loading || !result) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2
          className="size-8 animate-spin text-primary"
          aria-hidden="true"
        />
        <span className="sr-only">Loading orders...</span>
      </div>
    );
  }

  if (result.error) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        role="alert"
      >
        <Package className="size-12 text-destructive/50" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium">Failed to load orders</h3>
        <p className="mt-1 text-sm text-muted-foreground">{result.error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (result.orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package
          className="size-12 text-muted-foreground/50"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This customer hasn't placed any orders
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Phones: one card per order, no horizontal scrolling */}
      <ul className="space-y-3 md:hidden">
        {result.orders.map((order) => (
          <li key={order.id} className="space-y-2 rounded-lg border p-3">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 break-all font-mono text-sm">
                {order.id}
              </span>
              <Badge
                variant={getOrderBadgeVariant(order.status)}
                className="shrink-0"
              >
                {order.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {formatDate(order.createdAt)}, {order._count.items}{" "}
                {order._count.items === 1 ? "item" : "items"}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {formatCurrency(Number(order.totalAmount))}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tablet and up: table */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th scope="col" className={columnHeader}>
                  Order ID
                </th>
                <th scope="col" className={columnHeader}>
                  Date
                </th>
                <th scope="col" className={columnHeader}>
                  Status
                </th>
                <th scope="col" className={columnHeader}>
                  Items
                </th>
                <th scope="col" className={cn(columnHeader, "text-right")}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-accent/50"
                >
                  <td className="px-4 py-3 font-mono text-sm">{order.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getOrderBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {order._count.items}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatCurrency(Number(order.totalAmount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CustomerDetailsDialogContent({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<OrdersResult | null>(null);

  // Loading is derived: we're loading while the orders tab is open and the
  // stored result doesn't belong to this customer/attempt yet. This keeps
  // setState out of the effect body (it only runs after the request resolves).
  const requestKey = `${customer.id}:${attempt}`;
  const loadedKey = result?.key;
  const ordersLoading = activeTab === "orders" && loadedKey !== requestKey;

  useEffect(() => {
    if (activeTab !== "orders" || loadedKey === requestKey) return;

    let cancelled = false;
    adminOrdersService
      .getOrdersByUserId(customer.id)
      .then((response) => {
        if (!cancelled)
          setResult({ key: requestKey, orders: response.orders, error: null });
      })
      .catch(() => {
        if (!cancelled)
          setResult({
            key: requestKey,
            orders: [],
            error:
              "Something went wrong while fetching this customer's orders.",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, customer.id, requestKey, loadedKey]);

  const isAdmin = customer.role === "ADMIN";
  const roleBadge = (
    <Badge variant={isAdmin ? "destructive" : "neutral"}>{customer.role}</Badge>
  );
  const averageOrderValue =
    customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

  return (
    // The default close button is hidden (no-close-button), so the footer provides one.
    // p-0 / gap-0: header, scrolling body and footer manage their own spacing.
    <DialogContent className="no-close-button flex w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden p-0 max-h-[92dvh] sm:w-full sm:max-w-3xl sm:max-h-[90vh]">
      <DialogHeader className="shrink-0 space-y-1 p-4 text-left sm:p-6">
        <DialogTitle className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 break-words">{customer.name}</span>
          {roleBadge}
        </DialogTitle>
        <DialogDescription>
          Customer since {formatDate(customer.createdAt)}
        </DialogDescription>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto border-y">
        <div
          className="sticky top-0 z-20 grid grid-cols-2 border-b bg-background sm:flex sm:gap-4 sm:px-6"
          role="tablist"
          aria-label="Customer sections"
        >
          <button
            type="button"
            role="tab"
            id="customer-tab-overview"
            aria-selected={activeTab === "overview"}
            aria-controls="customer-panel-overview"
            onClick={() => setActiveTab("overview")}
            className={tabClass(activeTab === "overview")}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            id="customer-tab-orders"
            aria-selected={activeTab === "orders"}
            aria-controls="customer-panel-orders"
            onClick={() => setActiveTab("orders")}
            className={tabClass(activeTab === "orders")}
          >
            Orders ({customer.totalOrders})
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <div
              role="tabpanel"
              id="customer-panel-overview"
              aria-labelledby="customer-tab-overview"
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <StatCard
                  icon={Package}
                  bgColor="bg-primary/10"
                  textColor="text-primary"
                  label="Total Orders"
                  value={customer.totalOrders}
                />
                <StatCard
                  icon={DollarSign}
                  bgColor="bg-success/10"
                  textColor="text-success"
                  label="Total Spent"
                  value={formatCurrency(customer.totalSpent)}
                />
                <StatCard
                  icon={Calendar}
                  bgColor="bg-warning/10"
                  textColor="text-warning"
                  label="Member Since"
                  value={formatDate(customer.createdAt)}
                />
                <StatCard
                  icon={TrendingUp}
                  bgColor="bg-info/10"
                  textColor="text-info"
                  label="Avg. Order Value"
                  value={formatCurrency(averageOrderValue)}
                />
              </div>

              <section className="space-y-3 border-t pt-4 sm:space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:text-sm">
                  Contact Information
                </h3>
                <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <InfoCard label="Name" value={customer.name} icon={User} />
                  <InfoCard
                    label="Email"
                    value={customer.email}
                    icon={Mail}
                    isEmail
                  />
                  <InfoCard label="Role" value={roleBadge} icon={Package} />
                  <InfoCard
                    label="Account Created"
                    value={new Date(customer.createdAt).toLocaleString()}
                    icon={Calendar}
                  />
                </dl>
              </section>
            </div>
          )}

          {activeTab === "orders" && (
            <div
              role="tabpanel"
              id="customer-panel-orders"
              aria-labelledby="customer-tab-orders"
            >
              <OrdersPanel
                loading={ordersLoading}
                result={result?.key === requestKey ? result : null}
                onRetry={() => setAttempt((a) => a + 1)}
              />
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6">
        <Button
          variant="outline"
          onClick={onClose}
          className="h-11 w-full sm:h-10 sm:w-auto"
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function CustomerDetailsDialog({
  open,
  onClose,
  customer,
}: CustomerDetailsDialogProps) {
  if (!customer) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      {/* key resets the tab and orders when a different customer is opened */}
      <CustomerDetailsDialogContent
        key={customer.id}
        customer={customer}
        onClose={onClose}
      />
    </Dialog>
  );
}
