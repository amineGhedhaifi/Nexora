import { X, User, Calendar, Package, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

const mockCustomerOrders: Record<string, Order[]> = {
  "1": [
    { id: "NX-483920", date: "2024-12-15", total: 299.99, status: "DELIVERED", items: 1 },
    { id: "NX-483915", date: "2024-12-10", total: 149.50, status: "DELIVERED", items: 2 },
    { id: "NX-483908", date: "2024-11-28", total: 89.99, status: "DELIVERED", items: 1 },
    { id: "NX-483902", date: "2024-11-15", total: 425.00, status: "DELIVERED", items: 2 },
    { id: "NX-483895", date: "2024-11-02", total: 178.75, status: "DELIVERED", items: 3 },
  ],
  "2": [
    { id: "NX-483919", date: "2024-12-15", total: 149.50, status: "SHIPPED", items: 3 },
    { id: "NX-483912", date: "2024-12-05", total: 299.99, status: "DELIVERED", items: 1 },
  ],
  "4": [
    { id: "NX-483917", date: "2024-12-14", total: 425.00, status: "DELIVERED", items: 2 },
    { id: "NX-483911", date: "2024-12-08", total: 249.00, status: "DELIVERED", items: 1 },
    { id: "NX-483904", date: "2024-11-20", total: 349.99, status: "DELIVERED", items: 2 },
  ],
};

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerDetailsDialog({ open, onClose, customer }: CustomerDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [ordersExpanded, setOrdersExpanded] = useState<Record<string, boolean>>({});

  if (!customer) return null;

  const orders = mockCustomerOrders[customer.id] ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <DialogTitle className="flex items-center gap-2">
              {customer.name}
              <Badge variant={customer.role === "ADMIN" ? "destructive" : "secondary"} className="ml-2">
                {customer.role}
              </Badge>
            </DialogTitle>
            <DialogDescription>Customer since {formatDate(customer.createdAt)}</DialogDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
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
              Orders ({customer.orderCount})
            </button>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Package className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold tabular-nums">{customer.orderCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-success/10 text-success">
                        <DollarSign className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold tabular-nums">{formatCurrency(customer.totalSpent)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-warning/10 text-warning">
                        <Calendar className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="text-xl font-bold">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-info/10 text-info">
                        <User className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                        <p className="text-2xl font-bold tabular-nums">
                          {customer.orderCount > 0 ? formatCurrency(customer.totalSpent / customer.orderCount) : "$0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-lg border">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Name</label>
                      <p className="font-medium">{customer.name}</p>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</label>
                      <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Role</label>
                      <Badge variant={customer.role === "ADMIN" ? "destructive" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Account Created</label>
                      <p>{new Date(customer.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="size-12 text-muted-foreground/50" aria-hidden="true" />
                    <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This customer hasn't placed any orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const isExpanded = ordersExpanded[order.id];
                      return (
                        <div key={order.id} className="rounded-lg border overflow-hidden">
                          <button
                            onClick={() => setOrdersExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                            className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors text-left"
                            aria-expanded={isExpanded}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-medium">{order.id}</span>
                                <Badge variant={
                                  order.status === "DELIVERED" ? "success" :
                                  order.status === "SHIPPED" ? "warning" :
                                  order.status === "PENDING" ? "info" : "destructive"
                                }>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3.5" aria-hidden="true" />
                                  {formatDate(order.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Package className="size-3.5" aria-hidden="true" />
                                  {order.items} item{order.items !== 1 ? "s" : ""}
                                </span>
                                <span className="font-medium tabular-nums">{formatCurrency(order.total)}</span>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="size-5 text-muted-foreground" /> : <ChevronDown className="size-5 text-muted-foreground" />}
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t bg-accent/30">
                              <p className="text-sm text-muted-foreground">Order details would be loaded from the API here.</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}