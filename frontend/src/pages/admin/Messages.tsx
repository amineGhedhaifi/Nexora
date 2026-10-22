import { useState, useMemo } from "react";
import { Search, Mail, Eye, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ContactMessageDetailsDialog } from "@/components/admin/ContactMessageDetailsDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type ContactTopic = "GENERAL_INQUIRY" | "PRODUCT_QUESTION" | "ORDER_SUPPORT" | "SHIPPING_DELIVERY" | "RETURNS_REFUNDS" | "TECHNICAL_ISSUE" | "OTHER";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  createdAt: string;
  read: boolean;
}

const topicLabels: Record<ContactTopic, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  PRODUCT_QUESTION: "Product Question",
  ORDER_SUPPORT: "Order Support",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_REFUNDS: "Returns & Refunds",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
};

const mockMessages: ContactMessage[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@example.com", topic: "ORDER_SUPPORT", message: "I placed order NX-483920 but haven't received a confirmation email. Can you please check the status?", createdAt: "2024-12-15T10:30:00Z", read: true },
  { id: "2", name: "Michael Chen", email: "m.chen@example.com", topic: "PRODUCT_QUESTION", message: "Are the wireless headphones compatible with Android devices? Also, what's the battery life?", createdAt: "2024-12-15T09:15:00Z", read: false },
  { id: "3", name: "Emily Davis", email: "emily.d@example.com", topic: "SHIPPING_DELIVERY", message: "My order NX-483918 was supposed to arrive yesterday but tracking shows it's still in transit. When can I expect delivery?", createdAt: "2024-12-14T16:45:00Z", read: false },
  { id: "4", name: "James Wilson", email: "j.wilson@example.com", topic: "GENERAL_INQUIRY", message: "Do you offer bulk pricing for corporate orders? I'm looking to purchase 50+ units for my team.", createdAt: "2024-12-14T14:20:00Z", read: true },
  { id: "5", name: "Lisa Anderson", email: "l.anderson@example.com", topic: "RETURNS_REFUNDS", message: "I received the yoga mat but it has a defect. How do I initiate a return and get a refund?", createdAt: "2024-12-13T11:00:00Z", read: false },
  { id: "6", name: "Robert Taylor", email: "r.taylor@example.com", topic: "TECHNICAL_ISSUE", message: "The checkout page keeps throwing an error when I try to pay with my card. I've tried multiple cards.", createdAt: "2024-12-13T08:30:00Z", read: true },
  { id: "7", name: "Jennifer Martinez", email: "j.martinez@example.com", topic: "PRODUCT_QUESTION", message: "What materials is the leather messenger bag made from? Is it genuine leather?", createdAt: "2024-12-12T18:20:00Z", read: true },
  { id: "8", name: "David Thompson", email: "d.thompson@example.com", topic: "OTHER", message: "I'd like to provide feedback on my recent shopping experience. Overall great, but the mobile site could be faster.", createdAt: "2024-12-12T15:10:00Z", read: false },
];

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState<ContactTopic | "">("");
  const [sortBy, setSortBy] = useState<keyof ContactMessage>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ContactMessage | null>(null);

  const filteredMessages = useMemo(() => {
    return mockMessages
      .filter((msg) => {
        const matchesSearch = msg.name.toLowerCase().includes(search.toLowerCase()) ||
          msg.email.toLowerCase().includes(search.toLowerCase()) ||
          msg.message.toLowerCase().includes(search.toLowerCase());
        const matchesTopic = !topicFilter || msg.topic === topicFilter;
        return matchesSearch && matchesTopic;
      })
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [search, topicFilter, sortBy, sortOrder]);

  const handleDelete = (message: ContactMessage) => {
    setDeleteConfirm(message);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setDeleteConfirm(null);
    }
  };

  const unreadCount = mockMessages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">Manage customer contact submissions</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search messages"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={topicFilter}
              onValueChange={setTopicFilter}
              className="w-[200px]"
              aria-label="Filter by topic"
            >
              <option value="">All Topics</option>
              {(Object.keys(topicLabels) as ContactTopic[]).map((topic) => (
                <option key={topic} value={topic}>{topicLabels[topic]}</option>
              ))}
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select
                value={sortBy}
                onValueChange={setSortBy}
                className="w-[150px]"
                aria-label="Sort by"
              >
                <option value="createdAt">Date</option>
                <option value="name">Name</option>
                <option value="topic">Topic</option>
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
                    Topic
                    {sortBy === "topic" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground")}>
                  <div className="flex items-center gap-1">
                    Date
                    {sortBy === "createdAt" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col">Status</th>
                <th scope="col">Preview</th>
                <th scope="col" className="text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
              {filteredMessages.map((message) => (
                <tr
                  key={message.id}
                  className={cn("hover:bg-accent/50 transition-colors", !message.read && "bg-accent/30 font-medium")}
                >
                  <td>
                    <div>
                      <p className={cn("font-medium", !message.read && "text-foreground")}>{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.email}</p>
                    </div>
                  </td>
                  <td>
                    <Badge variant="secondary">{topicLabels[message.topic]}</Badge>
                  </td>
                  <td className="text-muted-foreground">{formatDate(message.createdAt.split("T")[0])}</td>
                  <td>
                    {message.read ? (
                      <Badge variant="outline" className="gap-1">
                        <Mail className="size-3" aria-hidden="true" />
                        Read
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <Mail className="size-3" aria-hidden="true" />
                        Unread
                      </Badge>
                    )}
                  </td>
                  <td className="max-w-[300px] truncate text-muted-foreground">
                    {message.message.substring(0, 80)}...
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedMessage(message)}
                        aria-label={`View message from ${message.name}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(message)}
                        aria-label={`Delete message from ${message.name}`}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Mail className="size-12 text-muted-foreground/50" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-medium">No messages found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || topicFilter ? "Try adjusting your search or filters" : "No contact messages yet"}
            </p>
          </div>
        )}
      </div>

      <ContactMessageDetailsDialog
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        message={selectedMessage}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Message"
        description={`Are you sure you want to delete the message from "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}