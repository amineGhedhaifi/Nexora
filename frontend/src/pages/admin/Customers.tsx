import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Eye,
  Package,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CustomerDetailsDialog } from "@/components/admin/CustomerDetailsDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminCustomersService } from "@/services/admin-customers.service";
import type {
  Customer,
  AdminCustomersPagination,
  CustomerRole,
} from "@/types/customer";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

type SortKey = keyof Customer;
type SortOrder = "asc" | "desc";

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

function CustomerAvatar() {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      <User className="size-5" aria-hidden="true" />
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState<CustomerRole | "">("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminCustomersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminCustomersService.getCustomers({
        page,
        limit,
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
      });
      setCustomers(response.customers);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: CustomerRole | "") => {
    setRoleFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setPage(1);
  };

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  // Note: this only reorders the customers on the current page (the API does the paging).
  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === "asc" ? -1 : 1;
      if (bVal == null) return sortOrder === "asc" ? 1 : -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [customers, sortBy, sortOrder]);

  const hasFilters = Boolean(search || roleFilter);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer accounts
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
                placeholder="Search customers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10"
                aria-label="Search customers"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
              <Select
                value={roleFilter}
                onChange={(e) =>
                  handleRoleFilterChange(e.target.value as CustomerRole | "")
                }
                className="w-full sm:w-[160px]"
                aria-label="Filter by role"
              >
                <option value="">All Roles</option>
                <option value="CLIENT">Clients</option>
                <option value="ADMIN">Administrators</option>
              </Select>

              <div className="flex min-w-0 items-center gap-2">
                <span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
                  Sort by:
                </span>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value as SortKey)}
                  className="w-full sm:w-[150px]"
                  aria-label="Sort by"
                >
                  <option value="createdAt">Date Joined</option>
                  <option value="name">Name</option>
                  <option value="totalOrders">Orders</option>
                  <option value="totalSpent">Total Spent</option>
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
            <span className="sr-only">Loading customers...</span>
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <User
              className="size-12 text-muted-foreground/50"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-medium">No customers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "No customers yet"}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Below lg: one card per customer, nothing scrolls sideways */}
            <ul className="divide-y lg:hidden">
              {sortedCustomers.map((customer) => (
                <li key={customer.id} className="space-y-3 p-4">
                  <div className="flex items-start gap-3">
                    <CustomerAvatar />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{customer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        customer.role === "ADMIN" ? "destructive" : "neutral"
                      }
                      className="shrink-0"
                    >
                      {customer.role}
                    </Badge>
                  </div>

                  <dl className="grid grid-cols-3 gap-2 text-sm">
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        Orders
                      </dt>
                      <dd className="mt-0.5 font-medium tabular-nums">
                        {customer.totalOrders}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        Spent
                      </dt>
                      <dd className="mt-0.5 break-words font-medium tabular-nums">
                        {formatCurrency(customer.totalSpent)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        Joined
                      </dt>
                      <dd className="mt-0.5 break-words">
                        {formatDate(customer.createdAt)}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-full"
                    onClick={() => setSelectedCustomer(customer)}
                    aria-label={`View ${customer.name}`}
                  >
                    <Eye className="mr-2 size-4" aria-hidden="true" />
                    View details
                  </Button>
                </li>
              ))}
            </ul>

            {/* lg and up: table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                    <th scope="col" className="whitespace-nowrap">
                      Customer
                    </th>
                    <SortableHeader
                      label="Role"
                      column="role"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Joined"
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Orders"
                      column="totalOrders"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Total Spent"
                      column="totalSpent"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th scope="col" className="whitespace-nowrap !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:border-b [&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_tr:last-child_td]:border-0">
                  {sortedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="transition-colors hover:bg-accent/50"
                    >
                      <td className="max-w-[280px]">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar />
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {customer.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge
                          variant={
                            customer.role === "ADMIN"
                              ? "destructive"
                              : "neutral"
                          }
                        >
                          {customer.role}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Package
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="tabular-nums">
                            {customer.totalOrders}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                          <span className="font-medium tabular-nums">
                            {formatCurrency(customer.totalSpent)}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedCustomer(customer)}
                            aria-label={`View ${customer.name}`}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="border-t p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {sortedCustomers.length} of {pagination.total}{" "}
                    customer{pagination.total !== 1 ? "s" : ""}
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

      <CustomerDetailsDialog
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
}
