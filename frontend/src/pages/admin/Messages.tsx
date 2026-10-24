import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Mail,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  MailX,
  MailCheck,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ContactMessageDetailsDialog } from "@/components/admin/ContactMessageDetailsDialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminContactService } from "@/services/admin-contact.service";
import type {
  ContactMessage,
  ContactTopic,
  ContactMessageStatus,
  ContactMessagesResponse,
} from "@/types/contact";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

type SortKey = keyof ContactMessage;
type SortOrder = "asc" | "desc";

const topicLabels: Record<ContactTopic, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  PRODUCT_QUESTION: "Product Question",
  ORDER_SUPPORT: "Order Support",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_REFUNDS: "Returns & Refunds",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
};

const statusLabels: Record<ContactMessageStatus, string> = {
  UNREAD: "Unread",
  READ: "Read",
  RESOLVED: "Resolved",
};

const statusConfig: Record<
  ContactMessageStatus,
  {
    variant:
      | "neutral"
      | "outline"
      | "success"
      | "info"
      | "destructive"
      | "primary"
      | "warning";
    label: string;
    icon: React.ReactNode;
  }
> = {
  UNREAD: {
    variant: "destructive",
    label: "Unread",
    icon: <MailX className="size-3" />,
  },
  READ: {
    variant: "outline",
    label: "Read",
    icon: <MailCheck className="size-3" />,
  },
  RESOLVED: {
    variant: "success",
    label: "Resolved",
    icon: <Archive className="size-3" />,
  },
};

const availableTopics = Object.keys(topicLabels) as ContactTopic[];
const availableStatuses = Object.keys(statusLabels) as ContactMessageStatus[];

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

function StatusBadge({ status }: { status: ContactMessageStatus }) {
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

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "">(
    "",
  );
  const [topicFilter, setTopicFilter] = useState<ContactTopic | "">("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<
    ContactMessagesResponse["pagination"]
  >({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const limit = 10;

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminContactService.getContactMessages({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        topic: topicFilter || undefined,
      });
      setMessages(response.contactMessages);
      setPagination(response.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, topicFilter, debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
  }, [fetchMessages]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: ContactMessageStatus | "") => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTopicFilterChange = (value: ContactTopic | "") => {
    setTopicFilter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTopicFilter("");
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

  const handleStatusUpdate = (updatedMessage: ContactMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
    );
  };

  // Counts unread messages on the current page only (the API does the paging).
  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

  // Also only reorders the current page.
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === "asc" ? -1 : 1;
      if (bVal == null) return sortOrder === "asc" ? 1 : -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [messages, sortBy, sortOrder]);

  const hasFilters = Boolean(search || statusFilter || topicFilter);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="shrink-0 text-xs">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage customer contact submissions
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
                placeholder="Search messages..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10"
                aria-label="Search messages"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
              <Select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(
                    e.target.value as ContactMessageStatus | "",
                  )
                }
                className="w-full sm:w-[160px]"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Select>

              <Select
                value={topicFilter}
                onChange={(e) =>
                  handleTopicFilterChange(e.target.value as ContactTopic | "")
                }
                className="w-full sm:w-[180px]"
                aria-label="Filter by topic"
              >
                <option value="">All Topics</option>
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topicLabels[topic]}
                  </option>
                ))}
              </Select>

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
                  <option value="name">Name</option>
                  <option value="topic">Topic</option>
                  <option value="status">Status</option>
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
            <span className="sr-only">Loading messages...</span>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <Mail
              className="size-12 text-muted-foreground/50"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-medium">No messages found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "No contact messages yet"}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Below lg: one card per message, nothing scrolls sideways */}
            <ul className="divide-y lg:hidden">
              {sortedMessages.map((message) => {
                const isUnread = message.status === "UNREAD";
                return (
                  <li
                    key={message.id}
                    className={cn("space-y-3 p-4", isUnread && "bg-accent/30")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate",
                            isUnread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {message.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {message.email}
                        </p>
                      </div>
                      <StatusBadge status={message.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Badge
                        variant="outline"
                        className="whitespace-normal text-left"
                      >
                        {topicLabels[message.topic]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>

                    <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                      {message.message}
                    </p>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-full"
                      onClick={() => setSelectedMessage(message)}
                      aria-label={`View message from ${message.name}`}
                    >
                      <Eye className="mr-2 size-4" aria-hidden="true" />
                      View message
                    </Button>
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
                      label="Customer"
                      column="name"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Topic"
                      column="topic"
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
                      label="Status"
                      column="status"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th scope="col">Preview</th>
                    <th scope="col" className="whitespace-nowrap !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:border-b [&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_tr:last-child_td]:border-0">
                  {sortedMessages.map((message) => (
                    <tr
                      key={message.id}
                      className={cn(
                        "transition-colors hover:bg-accent/50",
                        message.status === "UNREAD" &&
                          "bg-accent/30 font-medium",
                      )}
                    >
                      <td className="max-w-[240px]">
                        <p className="truncate font-medium">{message.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {message.email}
                        </p>
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge variant="outline">
                          {topicLabels[message.topic]}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="whitespace-nowrap">
                        <StatusBadge status={message.status} />
                      </td>
                      {/* CSS truncation adds the ellipsis only when the text is actually cut */}
                      <td className="max-w-[300px] truncate text-muted-foreground">
                        {message.message}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedMessage(message)}
                            aria-label={`View message from ${message.name}`}
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
                    Showing {sortedMessages.length} of {pagination.total}{" "}
                    message{pagination.total !== 1 ? "s" : ""}
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

      <ContactMessageDetailsDialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
