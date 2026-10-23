import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, User, Eye, Package, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CustomerDetailsDialog } from "@/components/admin/CustomerDetailsDialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminCustomersService } from "@/services/admin-customers.service";
import type { Customer, AdminCustomersPagination, CustomerRole } from "@/types/customer";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState<CustomerRole | "">("");
  const [sortBy, setSortBy] = useState<keyof Customer>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<AdminCustomersPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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

  const handleSort = (column: keyof Customer) => {
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

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer accounts</p>
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
                placeholder="Search customers..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
                aria-label="Search customers"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <Select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value as CustomerRole | "")}
                  className="w-full sm:w-[160px]"
                  aria-label="Filter by role"
                >
                  <option value="">All Roles</option>
                  <option value="CLIENT">Clients</option>
                  <option value="ADMIN">Administrators</option>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
                <span className="text-sm text-muted-foreground self-center whitespace-nowrap hidden sm:block">Sort by:</span>
                <div className="flex-1 min-w-0">
                  <Select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as keyof Customer)}
                    className="w-full sm:w-[150px]"
                    aria-label="Sort by"
                  >
                    <option value="createdAt">Date Joined</option>
                    <option value="name">Name</option>
                    <option value="totalOrders">Orders</option>
                    <option value="totalSpent">Total Spent</option>
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
              <span className="sr-only">Loading customers...</span>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[900px]" role="table">
                <thead>
                  <tr className="border-b [&_th]:px-4 sm:[&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                    <th scope="col" className="whitespace-nowrap">Customer</th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Role
                        {sortBy === "role" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Joined
                        {sortBy === "createdAt" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Orders
                        {sortBy === "totalOrders" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Total Spent
                        {sortBy === "totalSpent" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col" className="text-right pr-4 sm:pr-6 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:px-4 sm:[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
                  {sortedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-accent/50 transition-colors">
                      <td className="max-w-[200px] sm:max-w-none">
                        <div className="flex items-center gap-3">
                          <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                            <User className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium truncate">{customer.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge variant={customer.role === "ADMIN" ? "destructive" : "neutral"}>
                          {customer.role}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground whitespace-nowrap">{formatDate(customer.createdAt)}</td>
                      <td className="flex items-center gap-2 whitespace-nowrap">
                        <Package className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="tabular-nums">{customer.totalOrders}</span>
                      </td>
                      <td className="flex items-center gap-2 whitespace-nowrap">
                        <DollarSign className="size-4 text-muted-foreground" aria-hidden="true" />
                        <span className="font-medium tabular-nums">{formatCurrency(customer.totalSpent)}</span>
                      </td>
                      <td className="text-right pr-4 sm:pr-6 whitespace-nowrap">
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

              {sortedCustomers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <User className="size-12 text-muted-foreground/50" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium">No customers found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search || roleFilter ? "Try adjusting your search or filters" : "No customers yet"}
                  </p>
                  {(search || roleFilter) && (
                    <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setRoleFilter(""); }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {sortedCustomers.length} of {pagination.total} customer{pagination.total !== 1 ? "s" : ""}
                    </p>
                    <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CustomerDetailsDialog
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
}