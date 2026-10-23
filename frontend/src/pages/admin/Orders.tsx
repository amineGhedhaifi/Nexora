import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Eye, Truck, PackageCheck, XCircle, Clock, Package, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminOrdersService } from "@/services/admin-orders.service";
import type { AdminOrderSummary, AdminOrderDetails, AdminOrderStatus, AdminOrdersPagination } from "@/types/order";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<keyof AdminOrderSummary>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminOrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetails | null>(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [statusUpdateConfirm, setStatusUpdateConfirm] = useState<{ order: AdminOrderDetails; newStatus: AdminOrderStatus } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const limit = 10;

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === "asc" ? -1 : 1;
      if (bVal == null) return sortOrder === "asc" ? 1 : -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortBy, sortOrder]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter((order) => {
      const orderDate = order.createdAt.split("T")[0]; // Get YYYY-MM-DD part
      const matchesDateFrom = !dateFrom || orderDate >= dateFrom;
      const matchesDateTo = !dateTo || orderDate <= dateTo;
      return matchesDateFrom && matchesDateTo;
    });
  }, [sortedOrders, dateFrom, dateTo]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminOrdersService.getOrders({
        page,
        limit,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [fetchOrders]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: AdminOrderStatus | "") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
  };

  const handleStatusUpdate = (order: AdminOrderSummary) => {
    const newStatus = nextStatus[order.status];
    if (newStatus) {
      // For the confirmation dialog, we need AdminOrderDetails, but we only have AdminOrderSummary.
      // We'll create a minimal AdminOrderDetails object with the required fields.
      const orderDetails: AdminOrderDetails = {
        id: order.id,
        userId: null,
        trackingToken: null,
        status: order.status,
        totalAmount: order.totalAmount,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: [],
      };
      setStatusUpdateConfirm({ order: orderDetails, newStatus });
    }
  };

  const confirmStatusUpdate = async () => {
    if (!statusUpdateConfirm) return;
    setUpdatingStatus(true);
    try {
      await adminOrdersService.updateOrderStatus(statusUpdateConfirm.order.id, { status: statusUpdateConfirm.newStatus });
      setStatusUpdateConfirm(null);
      // Refetch orders to update the list
      fetchOrders();
      // Also refetch the selected order details if dialog is open
      if (selectedOrder) {
        const updatedOrder = await adminOrdersService.getOrderById(selectedOrder.id);
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = async (order: AdminOrderSummary) => {
    setSelectedOrderLoading(true);
    try {
      const details = await adminOrdersService.getOrderById(order.id);
      setSelectedOrder(details);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleSort = (column: keyof AdminOrderSummary) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
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

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-center gap-3" role="alert">
          <AlertCircle className="size-5 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
                aria-label="Search orders"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value as AdminOrderStatus | "")}
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
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full sm:w-[160px]"
                  placeholder="From"
                  aria-label="Date from"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
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
                      onChange={(e) => handleSort(e.target.value as keyof AdminOrderSummary)}
                      className="w-full sm:w-[150px]"
                      aria-label="Sort by"
                    >
                      <option value="createdAt">Date</option>
                      <option value="totalAmount">Total</option>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
              <span className="sr-only">Loading orders...</span>
            </div>
          ) : (
            <>
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
                        {sortBy === "createdAt" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Total
                        {sortBy === "totalAmount" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Status
                        {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className="whitespace-nowrap">Items</th>
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
                            <p className="text-xs text-muted-foreground truncate">{order.customerPhone}</p>
                          </div>
                        </td>
                        <td className="text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</td>
                        <td className="font-medium tabular-nums whitespace-nowrap">{formatCurrency(Number(order.totalAmount))}</td>
                        <td className="whitespace-nowrap">
                          <Badge variant={config.variant} className="gap-1 whitespace-nowrap">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap">
                          <Badge variant="neutral" className="gap-1 whitespace-nowrap">
                            <Package className="size-3" />
                            {order._count.items}
                          </Badge>
                        </td>
                        <td className="text-right pr-4 sm:pr-6 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                              aria-label={`View order ${order.id}`}
                              disabled={selectedOrderLoading}
                            >
                              <Eye className="size-4" />
                            </Button>
                            {next && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusUpdate(order)}
                                className="hidden sm:inline-flex"
                                disabled={updatingStatus}
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
                                disabled={updatingStatus}
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

              {pagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredOrders.length} of {pagination.total} order{pagination.total !== 1 ? "s" : ""}
                    </p>
                    <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
        disabled={updatingStatus}
      />
    </div>
  );
}