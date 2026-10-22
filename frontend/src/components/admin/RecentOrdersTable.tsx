import { Link } from "react-router-dom";
import { MoreHorizontal, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { RecentOrder } from "@/types/dashboard";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "info" | "destructive" | "outline";

const statusStyles: Record<string, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: "info", label: "Pending" },
  CONFIRMED: { variant: "primary", label: "Confirmed" },
  SHIPPED: { variant: "warning", label: "Shipped" },
  DELIVERED: { variant: "success", label: "Delivered" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
  ordered: { variant: "info", label: "Ordered" },
  shipping: { variant: "warning", label: "Shipping" },
  delivered: { variant: "success", label: "Delivered" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

interface RecentOrdersTableProps {
  orders: RecentOrder[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm min-w-0">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">Latest orders from your store</p>
          </div>
          <Link to="/admin/orders">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              View All
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]" role="table">
          <thead>
            <tr className="border-b [&_th]:px-4 sm:[&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
              <th scope="col" className="hidden sm:table-cell">Order ID</th>
              <th scope="col">Customer</th>
              <th scope="col" className="hidden md:table-cell">Date</th>
              <th scope="col" className="hidden sm:table-cell">Total</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right pr-4 sm:pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_td]:px-4 sm:[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No recent orders
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConfig = statusStyles[order.status.toUpperCase()] ?? statusStyles[order.status] ?? { variant: "neutral" as const, label: order.status };
                const isGuest = order.userId === null;
                return (
                  <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                    <td className="hidden sm:table-cell font-mono font-medium">{order.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{order.customerName}</p>
                        {isGuest && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Users className="size-3" />
                            Guest
                          </Badge>
                        )}
                        {!isGuest && (
                          <Badge variant="primary" className="gap-1 text-xs">
                            <User className="size-3" />
                            Registered
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="hidden sm:table-cell font-medium tabular-nums">{formatCurrency(Number(order.totalAmount))}</td>
                    <td>
                      <Badge variant={statusConfig.variant} className="gap-1">
                        {statusConfig.label}
                      </Badge>
                    </td>
                    <td className="text-right pr-4 sm:pr-6">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label={`View order ${order.id}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}