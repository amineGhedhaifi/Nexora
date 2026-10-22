import { Package, Users, DollarSign, ShoppingCart } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { BestSellingProducts } from "@/components/admin/BestSellingProducts";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useDashboard } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Overview of your store performance</p>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <StatCard key={i} label="Loading..." value={<Skeleton className="h-8 w-32" />} icon={DollarSign} />
          ))}
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4 min-w-0">
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm min-w-0">
              <div className="h-[240px] sm:h-[320px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 min-w-0">
            <div className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm min-w-0">
              <div className="space-y-3 sm:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 h-16">
                    <Skeleton className="size-7 sm:size-8 rounded-lg" />
                    <Skeleton className="size-12 sm:size-14 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm min-w-0">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">Recent Orders</h2>
                <p className="text-sm text-muted-foreground">Latest orders from your store</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]" role="table">
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 sm:px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 sm:px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-4 sm:px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Overview of your store performance</p>
          </div>
        </div>
        <Alert variant="destructive" className="flex gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Failed to load dashboard data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Something went wrong. Please try again."}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const stats = data ? [
    {
      label: "Total Revenue",
      value: formatCurrency(Number(data.stats.revenue)),
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: data.stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
    },
    {
      label: "Total Products",
      value: data.stats.totalProducts.toLocaleString(),
      icon: Package,
    },
    {
      label: "Total Customers",
      value: data.stats.totalCustomers.toLocaleString(),
      icon: Users,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of your store performance</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 min-w-0">
          <RevenueChart data={data?.revenueOverview ?? []} />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <BestSellingProducts products={data?.bestSellingProducts ?? []} />
        </div>
      </div>

      <RecentOrdersTable orders={data?.recentOrders ?? []} />
    </div>
  );
}