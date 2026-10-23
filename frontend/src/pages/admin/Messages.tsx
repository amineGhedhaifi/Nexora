import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Mail, Eye, ChevronDown, ChevronUp, Loader2, AlertCircle, MailX, MailCheck, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ContactMessageDetailsDialog } from "@/components/admin/ContactMessageDetailsDialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminContactService } from "@/services/admin-contact.service";
import type { ContactMessage, ContactTopic, ContactMessageStatus, ContactMessagesResponse } from "@/types/contact";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

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

const statusConfig: Record<ContactMessageStatus, { variant: "neutral" | "outline" | "success" | "info" | "destructive" | "primary" | "warning"; label: string; icon: React.ReactNode }> = {
  UNREAD: { variant: "destructive", label: "Unread", icon: <MailX className="size-3" /> },
  READ: { variant: "outline", label: "Read", icon: <MailCheck className="size-3" /> },
  RESOLVED: { variant: "success", label: "Resolved", icon: <Archive className="size-3" /> },
};

const availableTopics: { value: ContactTopic; label: string }[] = [
  { value: "GENERAL_INQUIRY", label: "General Inquiry" },
  { value: "PRODUCT_QUESTION", label: "Product Question" },
  { value: "ORDER_SUPPORT", label: "Order Support" },
  { value: "SHIPPING_DELIVERY", label: "Shipping & Delivery" },
  { value: "RETURNS_REFUNDS", label: "Returns & Refunds" },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
  { value: "OTHER", label: "Other" },
];

const availableStatuses: { value: ContactMessageStatus; label: string }[] = [
  { value: "UNREAD", label: "Unread" },
  { value: "READ", label: "Read" },
  { value: "RESOLVED", label: "Resolved" },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "">("");
  const [topicFilter, setTopicFilter] = useState<ContactTopic | "">("");
  const [sortBy, setSortBy] = useState<keyof ContactMessage>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ContactMessagesResponse["pagination"]>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
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

  const handleSort = (column: keyof ContactMessage) => {
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
    setMessages((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
  };

  const unreadCount = messages.filter((m) => m.status === "UNREAD").length;

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

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2 truncate">
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-2 shrink-0">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage customer contact submissions</p>
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
                placeholder="Search messages..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
                aria-label="Search messages"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value as ContactMessageStatus | "")}
                  className="w-full sm:w-[160px]"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {availableStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{statusLabels[status.value]}</option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-0">
                <Select
                  value={topicFilter}
                  onChange={(e) => handleTopicFilterChange(e.target.value as ContactTopic | "")}
                  className="w-full sm:w-[180px]"
                  aria-label="Filter by topic"
                >
                  <option value="">All Topics</option>
                  {availableTopics.map((topic) => (
                    <option key={topic.value} value={topic.value}>{topicLabels[topic.value]}</option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
                <span className="text-sm text-muted-foreground self-center whitespace-nowrap hidden sm:block">Sort by:</span>
                <div className="flex-1 min-w-0">
                  <Select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value as keyof ContactMessage)}
                    className="w-full sm:w-[150px]"
                    aria-label="Sort by"
                  >
                    <option value="createdAt">Date</option>
                    <option value="name">Name</option>
                    <option value="topic">Topic</option>
                    <option value="status">Status</option>
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
              <span className="sr-only">Loading messages...</span>
            </div>
          ) : (
            <>
              <table className="w-full min-w-[900px]" role="table">
                <thead>
                  <tr className="border-b [&_th]:px-4 sm:[&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                    <th scope="col" className="whitespace-nowrap">Customer</th>
                    <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap")}>
                      <div className="flex items-center gap-1">
                        Topic
                        {sortBy === "topic" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
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
                        Status
                        {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                      </div>
                    </th>
                    <th scope="col">Preview</th>
                    <th scope="col" className="text-right pr-4 sm:pr-6 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:px-4 sm:[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
                  {sortedMessages.map((message) => {
                    const config = statusConfig[message.status];
                    return (
                      <tr key={message.id} className={cn("hover:bg-accent/50 transition-colors", message.status === "UNREAD" && "bg-accent/30 font-medium")}>
                        <td className="max-w-[200px] sm:max-w-none">
                          <div>
                            <p className="font-medium truncate">{message.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <Badge variant="outline">{topicLabels[message.topic]}</Badge>
                        </td>
                        <td className="text-muted-foreground whitespace-nowrap">{formatDate(message.createdAt)}</td>
                        <td className="whitespace-nowrap">
                          <Badge variant={config.variant} className="gap-1 whitespace-nowrap">
                            {config.icon}
                            {config.label}
                          </Badge>
                        </td>
                        <td className="max-w-[300px] truncate text-muted-foreground">
                          {message.message.substring(0, 80)}...
                        </td>
                        <td className="text-right pr-4 sm:pr-6 whitespace-nowrap">
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
                    );
                  })}
                </tbody>
              </table>

              {sortedMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Mail className="size-12 text-muted-foreground/50" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-medium">No messages found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {search || statusFilter || topicFilter ? "Try adjusting your search or filters" : "No contact messages yet"}
                  </p>
                  {(search || statusFilter || topicFilter) && (
                    <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setStatusFilter(""); setTopicFilter(""); }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {sortedMessages.length} of {pagination.total} message{pagination.total !== 1 ? "s" : ""}
                    </p>
                    <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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