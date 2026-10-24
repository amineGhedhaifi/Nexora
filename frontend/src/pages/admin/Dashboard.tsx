import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  Clock,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { BestSellingProducts } from "@/components/admin/BestSellingProducts";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency, formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminOrderStatus } from "@/types/order";
import type { RecentOrder } from "@/types/dashboard";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Labels and icons are shared by the loading skeleton and the loaded cards,
// so nothing jumps around when the data arrives.
const statDefinitions = [
  { label: "Total Revenue", icon: DollarSign },
  { label: "Total Orders", icon: ShoppingCart },
  { label: "Total Products", icon: Package },
  { label: "Total Customers", icon: Users },
] as const;

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

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your store performance
        </p>
      </div>
    </div>
  );
}

type StatusDisplay = {
  variant:
    | "neutral"
    | "primary"
    | "destructive"
    | "success"
    | "warning"
    | "info";
  label: string;
  icon: React.ReactNode;
};

// The dashboard API types `status` as a plain string, so look it up safely
// and fall back to a neutral badge for any value we don't know about.
function StatusBadge({ status }: { status: string }) {
  const config: StatusDisplay = statusConfig[status as AdminOrderStatus] ?? {
    variant: "neutral",
    label: status,
    icon: null,
  };
  return (
    <Badge
      variant={config.variant}
      className="shrink-0 gap-1 whitespace-nowrap"
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}

function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="min-w-0 rounded-2xl border bg-card shadow-sm">
      <div className="border-b p-4 sm:p-6">
        <h2 className="truncate text-lg font-semibold">Recent Orders</h2>
        <p className="text-sm text-muted-foreground">
          Latest orders from your store
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <ShoppingCart
            className="size-12 text-muted-foreground/50"
            aria-hidden="true"
          />
          <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders will show up here
          </p>
        </div>
      ) : (
        <>
          {/* Below lg: stacked rows, nothing scrolls sideways */}
          <ul className="divide-y lg:hidden">
            {orders.map((order) => (
              <li key={order.id} className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-all font-mono text-sm font-medium">
                    {order.id}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="truncate text-sm">{order.customerName}</p>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* lg and up: table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                  <th scope="col" className="whitespace-nowrap">
                    Order ID
                  </th>
                  <th scope="col" className="whitespace-nowrap">
                    Customer
                  </th>
                  <th scope="col" className="whitespace-nowrap">
                    Date
                  </th>
                  <th scope="col" className="whitespace-nowrap">
                    Total
                  </th>
                  <th scope="col" className="whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="[&_td]:border-b [&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_tr:last-child_td]:border-0">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <td className="whitespace-nowrap font-mono font-medium">
                      {order.id}
                    </td>
                    <td className="max-w-[240px] truncate">
                      {order.customerName}
                    </td>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap font-medium tabular-nums">
                      {formatCurrency(Number(order.totalAmount))}
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6" aria-busy="true">
      <DashboardHeader />
      <span className="sr-only">Loading dashboard...</span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statDefinitions.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={<Skeleton className="h-8 w-32" />}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="min-w-0 lg:col-span-4">
          <div className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <Skeleton className="h-[240px] w-full sm:h-[320px]" />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-3">
          <div className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex h-16 items-center gap-3 sm:gap-4">
                  <Skeleton className="size-7 shrink-0 rounded-lg sm:size-8" />
                  <Skeleton className="size-12 shrink-0 rounded-lg sm:size-14" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="mt-1 h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16 shrink-0 sm:w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border bg-card shadow-sm">
        <div className="border-b p-4 sm:p-6">
          <h2 className="truncate text-lg font-semibold">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">
            Latest orders from your store
          </p>
        </div>

        {/* Below lg: stacked rows, same breakpoint as the real list */}
        <ul className="divide-y lg:hidden">
          {[...Array(5)].map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-w-0 space-y-6">
        <DashboardHeader />
        <Alert variant="destructive" className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Failed to load dashboard data</p>
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 h-10 w-full sm:w-auto"
            >
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const statValues = data
    ? [
        formatCurrency(Number(data.stats.revenue)),
        data.stats.totalOrders.toLocaleString(),
        data.stats.totalProducts.toLocaleString(),
        data.stats.totalCustomers.toLocaleString(),
      ]
    : [];

  return (
    <div className="min-w-0 space-y-6">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statValues.map((value, i) => (
          <StatCard
            key={statDefinitions[i].label}
            label={statDefinitions[i].label}
            value={value}
            icon={statDefinitions[i].icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <div className="min-w-0 lg:col-span-4">
          <RevenueChart data={data?.revenueOverview ?? []} />
        </div>
        <div className="min-w-0 lg:col-span-3">
          <BestSellingProducts products={data?.bestSellingProducts ?? []} />
        </div>
      </div>

      <RecentOrders orders={data?.recentOrders ?? []} />
    </div>
  );
}
