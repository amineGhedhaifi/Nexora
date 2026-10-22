import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, User, Eye, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CustomerDetailsDialog } from "@/components/admin/CustomerDetailsDialog";
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

const mockCustomers: Customer[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@example.com", role: "CLIENT", createdAt: "2024-01-15", orderCount: 12, totalSpent: 2847.50 },
  { id: "2", name: "Michael Chen", email: "m.chen@example.com", role: "CLIENT", createdAt: "2024-02-20", orderCount: 8, totalSpent: 1923.75 },
  { id: "3", name: "Emily Davis", email: "emily.d@example.com", role: "CLIENT", createdAt: "2024-03-10", orderCount: 3, totalSpent: 245.99 },
  { id: "4", name: "James Wilson", email: "j.wilson@example.com", role: "CLIENT", createdAt: "2024-04-05", orderCount: 15, totalSpent: 4156.80 },
  { id: "5", name: "Lisa Anderson", email: "l.anderson@example.com", role: "CLIENT", createdAt: "2024-05-12", orderCount: 5, totalSpent: 678.25 },
  { id: "6", name: "Robert Taylor", email: "r.taylor@example.com", role: "CLIENT", createdAt: "2024-06-18", orderCount: 2, totalSpent: 189.99 },
  { id: "7", name: "Jennifer Martinez", email: "j.martinez@example.com", role: "CLIENT", createdAt: "2024-07-22", orderCount: 7, totalSpent: 1134.50 },
  { id: "8", name: "David Thompson", email: "d.thompson@example.com", role: "CLIENT", createdAt: "2024-08-30", orderCount: 1, totalSpent: 256.80 },
  { id: "9", name: "Admin User", email: "admin@nexora.example", role: "ADMIN", createdAt: "2023-12-01", orderCount: 0, totalSpent: 0 },
  { id: "10", name: "Amanda Foster", email: "a.foster@example.com", role: "CLIENT", createdAt: "2024-09-15", orderCount: 4, totalSpent: 567.30 },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"CLIENT" | "ADMIN" | "">("");
  const [sortBy, setSortBy] = useState<keyof Customer>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return mockCustomers
      .filter((customer) => {
        const matchesSearch = customer.name.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = !roleFilter || customer.role === roleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [search, roleFilter, sortBy, sortOrder]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-1 text-muted-foreground">Manage customer accounts</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search customers"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              className="w-[150px]"
              aria-label="Filter by role"
            >
              <option value="">All Roles</option>
              <option value="CLIENT">Clients</option>
              <option value="ADMIN">Admins</option>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                className="w-[150px]"
                aria-label="Sort by"
              >
                <option value="createdAt">Date Joined</option>
                <option value="name">Name</option>
                <option value="orderCount">Orders</option>
                <option value="totalSpent">Total Spent</option>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              >
                {sortOrder === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                <th scope="col">Customer</th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground")}>
                  <div className="flex items-center gap-1">
                    Role
                    {sortBy === "role" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground")}>
                  <div className="flex items-center gap-1">
                    Joined
                    {sortBy === "createdAt" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground")}>
                  <div className="flex items-center gap-1">
                    Orders
                    {sortBy === "orderCount" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground")}>
                  <div className="flex items-center gap-1">
                    Total Spent
                    {sortBy === "totalSpent" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-accent/50 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                        <User className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={customer.role === "ADMIN" ? "destructive" : "secondary"}>
                      {customer.role}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">{formatDate(customer.createdAt)}</td>
                  <td className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="tabular-nums">{customer.orderCount}</span>
                  </td>
                  <td className="flex items-center gap-2">
                    <DollarSign className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="font-medium tabular-nums">{formatCurrency(customer.totalSpent)}</span>
                  </td>
                  <td className="text-right pr-6">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCustomer(customer)}
                      aria-label={`View ${customer.name}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <User className="size-12 text-muted-foreground/50" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-medium">No customers found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || roleFilter ? "Try adjusting your search or filters" : "No customers yet"}
            </p>
          </div>
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