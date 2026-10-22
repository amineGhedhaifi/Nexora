import { Package, Users, DollarSign, ShoppingCart } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import { BestSellingProducts } from "@/components/admin/BestSellingProducts";
import { RevenueChart } from "@/components/admin/RevenueChart";

const stats = [
  {
    label: "Total Revenue",
    value: "$127,432.00",
    change: "+12.5%",
    changeType: "increase" as const,
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    changeType: "increase" as const,
    icon: ShoppingCart,
  },
  {
    label: "Total Products",
    value: "248",
    change: "+5",
    changeType: "increase" as const,
    icon: Package,
  },
  {
    label: "Total Customers",
    value: "892",
    change: "+3.1%",
    changeType: "increase" as const,
    icon: Users,
  },
];

export default function Dashboard() {
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
          <RevenueChart />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <BestSellingProducts />
        </div>
      </div>

      <RecentOrdersTable />
    </div>
  );
}