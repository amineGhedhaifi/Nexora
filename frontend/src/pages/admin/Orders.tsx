import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Truck,
  PackageCheck,
  XCircle,
  Clock,
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { OrderDetailsDialog } from "@/components/admin/OrderDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminOrdersService } from "@/services/admin-orders.service";
import type {
  AdminOrderSummary,
  AdminOrderDetails,
  AdminOrderStatus,
  AdminOrdersPagination,
} from "@/types/order";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

type SortKey = keyof AdminOrderSummary;
type SortOrder = "asc" | "desc";

const statusOrder: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

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

const nextStatus: Record<AdminOrderStatus, AdminOrderStatus | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortBy: SortKey;
  sortOrder: SortOrder;
  onSort: (column: SortKey) => void;
}) {
  const active = sortBy === column;
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
      }
      className="whitespace-nowrap"
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
        {active &&
          (sortOrder === "asc" ? (
            <ChevronUp className="size-3.5 text-primary" />
          ) : (
            <ChevronDown className="size-3.5 text-primary" />
          ))}
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  const config = statusConfig[status];
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

function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-[160px]"
        aria-label={`Date ${label.toLowerCase()}`}
      />
    </label>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminOrdersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetails | null>(
    null,
  );
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [statusUpdateConfirm, setStatusUpdateConfirm] = useState<{
    order: AdminOrderDetails;
    newStatus: AdminOrderStatus;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const limit = 10;

  // Sorting and the date range only apply to the orders on the current page (the API does the paging).
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
      const orderDate = order.createdAt.split("T")[0]; // YYYY-MM-DD
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

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleStatusUpdate = (order: AdminOrderSummary) => {
    const newStatus = nextStatus[order.status];
    if (newStatus) {
      // The confirmation dialog expects AdminOrderDetails, but the list only has a summary,
      // so build a minimal details object with the fields the dialog needs.
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
      await adminOrdersService.updateOrderStatus(statusUpdateConfirm.order.id, {
        status: statusUpdateConfirm.newStatus,
      });
      // Refetch orders to update the list
      fetchOrders();
      // Also refresh the open details dialog
      if (selectedOrder) {
        const updatedOrder = await adminOrdersService.getOrderById(
          selectedOrder.id,
        );
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      // Close the confirmation on success *and* failure, so an error isn't hidden behind the modal.
      setStatusUpdateConfirm(null);
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

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const hasFilters = Boolean(search || statusFilter || dateFrom || dateTo);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track customer orders
          </p>
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-4 sm:items-center"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-destructive sm:mt-0"
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1 break-words text-sm text-destructive">
            {error}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm">
        {/* Filters */}
        <div className="border-b p-4">
          <div className="flex flex-col gap-3">
            <div className="relative min-w-0">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                placeholder="Search orders, customers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10"
                aria-label="Search orders"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
              <label className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <Select
                  value={statusFilter}
                  onChange={(e) =>
                    handleStatusFilterChange(
                      e.target.value as AdminOrderStatus | "",
                    )
                  }
                  className="w-full sm:w-[160px]"
                  aria-label="Filter by status"
                >
                  <option value="">All Status</option>
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {statusConfig[status].label}
                    </option>
                  ))}
                </Select>
              </label>

              <DateFilter
                label="From"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
              <DateFilter
                label="To"
                value={dateTo}
                onChange={handleDateToChange}
              />

              <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
                <span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
                  Sort by:
                </span>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as SortKey)}
                  className="w-full sm:w-[150px]"
                  aria-label="Sort by"
                >
                  <option value="createdAt">Date</option>
                  <option value="totalAmount">Total</option>
                  <option value="status">Status</option>
                  <option value="customerName">Customer</option>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  aria-label={
                    sortOrder === "asc" ? "Sort descending" : "Sort ascending"
                  }
                  className="shrink-0"
                >
                  {sortOrder === "asc" ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="size-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <Package
              className="size-12 text-muted-foreground/50"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-medium">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "No orders yet"}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Below lg: one card per order, nothing scrolls sideways */}
            <ul className="divide-y lg:hidden">
              {filteredOrders.map((order) => {
                const next = nextStatus[order.status];
                return (
                  <li key={order.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 break-all font-mono text-sm font-medium">
                        {order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {order.customerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.customerPhone}
                      </p>
                    </div>

                    <dl className="grid grid-cols-3 gap-2 text-sm">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Date</dt>
                        <dd className="mt-0.5 break-words">
                          {formatDate(order.createdAt)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Total</dt>
                        <dd className="mt-0.5 break-words font-medium tabular-nums">
                          {formatCurrency(Number(order.totalAmount))}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Items</dt>
                        <dd className="mt-0.5 flex items-center gap-1 tabular-nums">
                          <Package
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {order._count.items}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1"
                        onClick={() => handleViewOrder(order)}
                        disabled={selectedOrderLoading}
                        aria-label={`View order ${order.id}`}
                      >
                        <Eye className="mr-2 size-4" aria-hidden="true" />
                        View
                      </Button>
                      {next && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 flex-1"
                          onClick={() => handleStatusUpdate(order)}
                          disabled={updatingStatus}
                          aria-label={`Mark order ${order.id} as ${statusConfig[next].label}`}
                        >
                          Mark as {statusConfig[next].label}
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* lg and up: table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                    <SortableHeader
                      label="Order ID"
                      column="id"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Customer"
                      column="customerName"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Date"
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Total"
                      column="totalAmount"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Status"
                      column="status"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th scope="col" className="whitespace-nowrap">
                      Items
                    </th>
                    <th scope="col" className="whitespace-nowrap !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:border-b [&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_tr:last-child_td]:border-0">
                  {filteredOrders.map((order) => {
                    const next = nextStatus[order.status];
                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-accent/50"
                      >
                        <td className="whitespace-nowrap font-mono font-medium">
                          {order.id}
                        </td>
                        <td className="max-w-[240px]">
                          <p className="truncate font-medium">
                            {order.customerName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {order.customerPhone}
                          </p>
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
                        <td className="whitespace-nowrap">
                          <Badge
                            variant="neutral"
                            className="gap-1 whitespace-nowrap"
                          >
                            <Package className="size-3" />
                            {order._count.items}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap">
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
                                disabled={updatingStatus}
                              >
                                Mark as {statusConfig[next].label}
                                <ChevronRight
                                  className="ml-1 size-4"
                                  aria-hidden="true"
                                />
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

            {pagination.totalPages > 1 && (
              <div className="border-t p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {pagination.total} order
                    {pagination.total !== 1 ? "s" : ""}
                  </p>
                  <div className="overflow-x-auto">
                    <Pagination
                      page={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OrderDetailsDialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusUpdate={(order, newStatus) =>
          setStatusUpdateConfirm({ order, newStatus })
        }
        updating={updatingStatus}
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
