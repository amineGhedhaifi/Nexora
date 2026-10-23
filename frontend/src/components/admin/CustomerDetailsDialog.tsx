import { User, Calendar, Package, DollarSign, Mail, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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

function StatCard({ icon: Icon, bgColor, textColor, label, value }: {
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-5 rounded-xl border bg-card">
      <div className="flex flex-col items-center text-center">
        <div className={cn("size-12 rounded-lg flex items-center justify-center", bgColor, textColor)}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function CustomerDetailsDialog({ open, onClose, customer }: CustomerDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer || activeTab !== "orders") return;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await adminOrdersService.getOrdersByUserId(customer.id);
        setOrders(response.orders);
      } catch (err) {
        setOrdersError("Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [customer, activeTab]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] no-close-button">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle className="flex items-center gap-2">
              {customer.name}
              <Badge variant={customer.role === "ADMIN" ? "destructive" : "neutral"} className="ml-2">
                {customer.role}
              </Badge>
            </DialogTitle>
            <DialogDescription>Customer since {formatDate(customer.createdAt)}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="border-y">
          <div className="flex gap-4 border-b px-6" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              className={cn(
                "py-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "overview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Overview
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              className={cn(
                "py-4 px-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === "orders"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Orders ({customer.totalOrders})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    icon={User}
                    bgColor="bg-info/10"
                    textColor="text-info"
                    label="Avg. Order Value"
                    value={customer.totalOrders > 0 ? formatCurrency(customer.totalSpent / customer.totalOrders) : "$0.00"}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoCard label="Name" value={customer.name} icon={User} />
                    <InfoCard label="Email" value={customer.email} icon={Mail} isEmail={true} />
                    <InfoCard label="Role" value={<Badge variant={customer.role === "ADMIN" ? "destructive" : "neutral"}>{customer.role}</Badge>} icon={Package} />
                    <InfoCard label="Account Created" value={new Date(customer.createdAt).toLocaleString()} icon={Calendar} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
                    <span className="sr-only">Loading orders...</span>
                  </div>
                ) : ordersError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="size-12 text-destructive/50" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-medium">Failed to load orders</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{ordersError}</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="size-12 text-muted-foreground/50" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This customer hasn't placed any orders</p>
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                              <td className="px-4 py-3 font-mono text-sm">{order.id}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(order.createdAt)}</td>
                              <td className="px-4 py-3">
                                <Badge variant={
                                  order.status === "DELIVERED" ? "success" :
                                  order.status === "SHIPPED" ? "warning" :
                                  order.status === "PENDING" ? "info" :
                                  order.status === "CONFIRMED" ? "info" : "destructive"
                                }>
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">{order._count.items}</td>
                              <td className="px-4 py-3 text-right font-medium tabular-nums">{formatCurrency(Number(order.totalAmount))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({ label, value, icon: Icon, isEmail = false }: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  isEmail?: boolean;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card/50">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
          {isEmail ? (
            <a href={`mailto:${value}`} className="hover:underline block break-all">{value}</a>
          ) : (
            <div className="font-medium">{value}</div>
          )}
        </div>
      </div>
    </div>
  );
}