import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Eye, Truck, PackageCheck, XCircle, Clock, User, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    image: string | null;
    quantity: number;
  }>;
  customerType: "registered" | "guest";
}

export const mockOrders: Order[] = [
  {
    id: "NX-483920",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    customerPhone: "+1 555-0123",
    shippingAddress: "123 Main St, Springfield, IL 62701",
    date: "2024-12-15",
    total: 299.99,
    status: "DELIVERED",
    customerType: "registered",
    items: [
      { productId: "1", name: "Wireless Noise-Canceling Headphones", price: 299.99, image: "/images/headphones.jpg", quantity: 1 },
    ],
  },
  {
    id: "NX-483919",
    customerName: "Michael Chen",
    customerEmail: "m.chen@example.com",
    customerPhone: "+1 555-0124",
    shippingAddress: "456 Oak Ave, Chicago, IL 60601",
    date: "2024-12-15",
    total: 149.50,
    status: "SHIPPED",
    customerType: "registered",
    items: [
      { productId: "4", name: "Stainless Steel Water Bottle", price: 29.99, image: "/images/bottle.jpg", quantity: 2 },
      { productId: "5", name: "Bluetooth Mechanical Keyboard", price: 149.99, image: "/images/keyboard.jpg", quantity: 1 },
    ],
  },
  {
    id: "NX-483918",
    customerName: "Emily Davis",
    customerEmail: "emily.d@example.com",
    customerPhone: "+1 555-0125",
    shippingAddress: "789 Elm St, Austin, TX 78701",
    date: "2024-12-14",
    total: 89.99,
    status: "PENDING",
    customerType: "guest",
    items: [
      { productId: "3", name: "Organic Cotton T-Shirt (3-pack)", price: 49.99, image: "/images/tshirt.jpg", quantity: 1 },
    ],
  },
  {
    id: "NX-483917",
    customerName: "James Wilson",
    customerEmail: "j.wilson@example.com",
    customerPhone: "+1 555-0126",
    shippingAddress: "321 Pine Rd, Denver, CO 80201",
    date: "2024-12-14",
    total: 425.00,
    status: "DELIVERED",
    customerType: "registered",
    items: [
      { productId: "1", name: "Wireless Noise-Canceling Headphones", price: 299.99, image: "/images/headphones.jpg", quantity: 1 },
      { productId: "2", name: "Premium Leather Messenger Bag", price: 249.00, image: "/images/bag.jpg", quantity: 1 },
    ],
  },
  {
    id: "NX-483916",
    customerName: "Lisa Anderson",
    customerEmail: "l.anderson@example.com",
    customerPhone: "+1 555-0127",
    shippingAddress: "654 Maple Dr, Seattle, WA 98101",
    date: "2024-12-13",
    total: 178.75,
    status: "PENDING",
    customerType: "guest",
    items: [
      { productId: "6", name: "Minimalist Desk Lamp", price: 59.99, image: "/images/lamp.jpg", quantity: 3 },
    ],
  },
  {
    id: "NX-483915",
    customerName: "Robert Taylor",
    customerEmail: "r.taylor@example.com",
    customerPhone: "+1 555-0128",
    shippingAddress: "987 Cedar Ln, Miami, FL 33101",
    date: "2024-12-13",
    total: 312.25,
    status: "SHIPPED",
    customerType: "registered",
    items: [
      { productId: "7", name: "Yoga Mat Premium", price: 39.99, image: "/images/yoga.jpg", quantity: 2 },
      { productId: "8", name: "Ceramic Coffee Mug Set (4)", price: 34.99, image: "/images/mugs.jpg", quantity: 1 },
    ],
  },
  {
    id: "NX-483914",
    customerName: "Jennifer Martinez",
    customerEmail: "j.martinez@example.com",
    customerPhone: "+1 555-0129",
    shippingAddress: "147 Birch Way, Phoenix, AZ 85001",
    date: "2024-12-12",
    total: 95.00,
    status: "DELIVERED",
    customerType: "registered",
    items: [
      { productId: "4", name: "Stainless Steel Water Bottle", price: 29.99, image: "/images/bottle.jpg", quantity: 2 },
    ],
  },
  {
    id: "NX-483913",
    customerName: "David Thompson",
    customerEmail: "d.thompson@example.com",
    customerPhone: "+1 555-0130",
    shippingAddress: "258 Spruce St, Boston, MA 02101",
    date: "2024-12-12",
    total: 256.80,
    status: "CANCELLED",
    customerType: "guest",
    items: [
      { productId: "5", name: "Bluetooth Mechanical Keyboard", price: 149.99, image: "/images/keyboard.jpg", quantity: 1 },
      { productId: "3", name: "Organic Cotton T-Shirt (3-pack)", price: 49.99, image: "/images/tshirt.jpg", quantity: 2 },
    ],
  },
];

const statusOrder: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusConfig: Record<OrderStatus, { variant: "neutral" | "primary" | "destructive" | "success" | "warning" | "info"; label: string; icon: React.ReactNode }> = {
  PENDING: { variant: "info", label: "Pending", icon: <Clock className="size-3" /> },
  CONFIRMED: { variant: "primary", label: "Confirmed", icon: <PackageCheck className="size-3" /> },
  SHIPPED: { variant: "warning", label: "Shipped", icon: <Truck className="size-3" /> },
  DELIVERED: { variant: "success", label: "Delivered", icon: <PackageCheck className="size-3" /> },
  CANCELLED: { variant: "destructive", label: "Cancelled", icon: <XCircle className="size-3" /> },
};

const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<keyof Order>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateConfirm, setStatusUpdateConfirm] = useState<{ order: Order; newStatus: OrderStatus } | null>(null);

  const filteredOrders = useMemo(() => {
    return mockOrders
      .filter((order) => {
        const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesDateFrom = !dateFrom || order.date >= dateFrom;
        const matchesDateTo = !dateTo || order.date <= dateTo;
        return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
      })
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, statusFilter, dateFrom, dateTo, sortBy, sortOrder]);

  const handleStatusUpdate = (order: Order) => {
    const newStatus = nextStatus[order.status];
    if (newStatus) {
      setStatusUpdateConfirm({ order, newStatus });
    }
  };

  const confirmStatusUpdate = () => {
    if (statusUpdateConfirm) {
      // In real app: await updateOrderStatus(statusUpdateConfirm.order.id, statusUpdateConfirm.newStatus)
      setStatusUpdateConfirm(null);
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track customer orders</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full"
                aria-label="Search orders"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  className="w-full sm:w-[160px]"
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>{statusConfig[status].label}</option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full sm:w-[160px]"
                  placeholder="From"
                  aria-label="Date from"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full sm:w-[160px]"
                  placeholder="To"
                  aria-label="Date to"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
                <span className="text-sm text-muted-foreground self-center whitespace-nowrap hidden sm:block">Sort by:</span>
                <div className="flex-1 min-w-0">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                    className="w-full sm:w-[150px]"
                    aria-label="Sort by"
                  >
                    <option value="date">Date</option>
                    <option value="total">Total</option>
                    <option value="status">Status</option>
                    <option value="customerName">Customer</option>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
                  className="shrink-0"
                >
                  {sortOrder === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 min-w-0">
          <table className="w-full min-w-[900px]" role="table">
            <thead>
              <tr className="border-b [&_th]:px-4 sm:[&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                  <div className="flex items-center gap-1">
                    Order ID
                    {sortBy === "id" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                  <div className="flex items-center gap-1">
                    Customer
                    {sortBy === "customerName" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                  <div className="flex items-center gap-1">
                    Total
                    {sortBy === "total" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                  <div className="flex items-center gap-1">
                    Status
                    {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className="whitespace-nowrap">Type</th>
                <th scope="col" className="text-right pr-4 sm:pr-6 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-4 sm:[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status];
                const next = nextStatus[order.status];
                return (
                  <tr key={order.id} className="hover:bg-accent/50 transition-colors">
                    <td className="font-mono font-medium whitespace-nowrap">{order.id}</td>
                    <td className="max-w-[200px] sm:max-w-none">
                      <div>
                        <p className="font-medium truncate">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground truncate">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground whitespace-nowrap">{formatDate(order.date)}</td>
                    <td className="font-medium tabular-nums whitespace-nowrap">{formatCurrency(order.total)}</td>
                    <td className="whitespace-nowrap">
                      <Badge variant={config.variant} className="gap-1 whitespace-nowrap">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap">
                      <Badge variant={order.customerType === "registered" ? "primary" : "outline"} className="gap-1 whitespace-nowrap">
                        {order.customerType === "registered" ? <User className="size-3" /> : <User className="size-3" />}
                        {order.customerType === "registered" ? "Registered" : "Guest"}
                      </Badge>
                    </td>
                    <td className="text-right pr-4 sm:pr-6 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`View order ${order.id}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {next && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order)}
                            className="hidden sm:inline-flex"
                          >
                            Mark as {statusConfig[next].label}
                          </Button>
                        )}
                        {next && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleStatusUpdate(order)}
                            className="sm:hidden"
                            aria-label={`Mark order ${order.id} as ${statusConfig[next].label}`}
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Package className="size-12 text-muted-foreground/50" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-medium">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || statusFilter || dateFrom || dateTo
                ? "Try adjusting your search or filters"
                : "No orders yet"}
            </p>
          </div>
        )}
      </div>

      <OrderDetailsDialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusUpdate={(order, newStatus) => setStatusUpdateConfirm({ order, newStatus })}
      />

      <ConfirmDialog
        open={!!statusUpdateConfirm}
        onClose={() => setStatusUpdateConfirm(null)}
        onConfirm={confirmStatusUpdate}
        title="Update Order Status"
        description={`Change order ${statusUpdateConfirm?.order.id} status from ${statusConfig[statusUpdateConfirm?.order.status ?? "PENDING"].label} to ${statusConfig[statusUpdateConfirm?.newStatus ?? "PENDING"].label}?`}
        confirmText="Update Status"
      />
    </div>
  );
}