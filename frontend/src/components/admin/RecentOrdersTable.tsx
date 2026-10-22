import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: "ordered" | "shipping" | "delivered" | "cancelled";
  customerType: "registered" | "guest";
}

const mockOrders: Order[] = [
  { id: "NX-483920", customer: "Sarah Johnson", email: "sarah.j@example.com", date: "2024-12-15", total: 299.99, status: "delivered", customerType: "registered" },
  { id: "NX-483919", customer: "Michael Chen", email: "m.chen@example.com", date: "2024-12-15", total: 149.50, status: "shipping", customerType: "registered" },
  { id: "NX-483918", customer: "Emily Davis", email: "emily.d@example.com", date: "2024-12-14", total: 89.99, status: "ordered", customerType: "guest" },
  { id: "NX-483917", customer: "James Wilson", email: "j.wilson@example.com", date: "2024-12-14", total: 425.00, status: "delivered", customerType: "registered" },
  { id: "NX-483916", customer: "Lisa Anderson", email: "l.anderson@example.com", date: "2024-12-13", total: 178.75, status: "ordered", customerType: "guest" },
  { id: "NX-483915", customer: "Robert Taylor", email: "r.taylor@example.com", date: "2024-12-13", total: 312.25, status: "shipping", customerType: "registered" },
  { id: "NX-483914", customer: "Jennifer Martinez", email: "j.martinez@example.com", date: "2024-12-12", total: 95.00, status: "delivered", customerType: "registered" },
  { id: "NX-483913", customer: "David Thompson", email: "d.thompson@example.com", date: "2024-12-12", total: 256.80, status: "cancelled", customerType: "guest" },
];

const statusStyles: Record<Order["status"], { variant: "success" | "warning" | "info" | "destructive" | "neutral"; label: string }> = {
  ordered: { variant: "info", label: "Ordered" },
  shipping: { variant: "warning", label: "Shipping" },
  delivered: { variant: "success", label: "Delivered" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

export function RecentOrdersTable() {
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
            {mockOrders.map((order) => {
              const statusConfig = statusStyles[order.status];
              return (
                <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                  <td className="hidden sm:table-cell font-mono font-medium">{order.id}</td>
                  <td>
                    <div>
                      <p className="font-medium truncate">{order.customer}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.email}</p>
                      <span className={cn("inline-block mt-1 text-xs px-2 py-0.5 rounded", order.customerType === "registered" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300")}>
                        {order.customerType === "registered" ? "Registered" : "Guest"}
                      </span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell text-muted-foreground">{formatDate(order.date)}</td>
                  <td className="hidden sm:table-cell font-medium tabular-nums">{formatCurrency(order.total)}</td>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}