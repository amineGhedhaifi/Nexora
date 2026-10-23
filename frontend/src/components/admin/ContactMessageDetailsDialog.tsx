import { Mail, User, Calendar, Tag, Copy, Check, MailCheck, MailX, Archive, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { adminContactService } from "@/services/admin-contact.service";
import type { ContactMessage, ContactMessageStatus, ContactTopic } from "@/types/contact";

const topicLabels: Record<ContactTopic, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  PRODUCT_QUESTION: "Product Question",
  ORDER_SUPPORT: "Order Support",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_REFUNDS: "Returns & Refunds",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
};

const statusConfig: Record<ContactMessageStatus, { variant: "neutral" | "outline" | "success" | "info" | "destructive" | "primary" | "warning"; label: string; icon: React.ReactNode }> = {
  UNREAD: { variant: "destructive", label: "Unread", icon: <MailX className="size-3" /> },
  READ: { variant: "outline", label: "Read", icon: <MailCheck className="size-3" /> },
  RESOLVED: { variant: "success", label: "Resolved", icon: <Archive className="size-3" /> },
};

const availableStatuses: { value: ContactMessageStatus; label: string }[] = [
  { value: "UNREAD", label: "Mark as Unread" },
  { value: "READ", label: "Mark as Read" },
  { value: "RESOLVED", label: "Mark as Resolved" },
];

interface ContactMessageDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onStatusUpdate?: (message: ContactMessage) => void;
}

function ContactMessageDetailsDialogContent({ message, onStatusUpdate }: Omit<ContactMessageDetailsDialogProps, "open">) {
  const [copied, setCopied] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localMessage, setLocalMessage] = useState<ContactMessage>(message!);

  const config = statusConfig[localMessage.status];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleStatusUpdate = async (status: ContactMessageStatus) => {
    if (updatingStatus || localMessage.status === status) return;
    setUpdatingStatus(true);
    try {
      const updatedMessage = await adminContactService.updateContactMessageStatus(localMessage.id, { status });
      setLocalMessage(updatedMessage);
      onStatusUpdate?.(updatedMessage);
    } catch (error) {
      console.error("Failed to update message status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh]">
      <DialogHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              Message Details
              <Badge variant={config.variant} className="gap-1 shrink-0">
                {config.icon}
                {config.label}
              </Badge>
            </DialogTitle>
            <DialogDescription>Received on {formatDate(localMessage.createdAt.split("T")[0])}</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="p-6 space-y-6 border-y">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</label>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">{localMessage.name}</p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
              <a
                href={`mailto:${localMessage.email}`}
                className="hover:underline"
                onClick={(e) => { e.preventDefault(); copyToClipboard(localMessage.email, "email"); }}
              >
                {localMessage.email}
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => copyToClipboard(localMessage.email, "email")}
                aria-label="Copy email"
                disabled={updatingStatus}
              >
                {copied === "email" ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</label>
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="outline">{topicLabels[localMessage.topic]}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</label>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
              <p>{new Date(localMessage.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</label>
          <div className="p-4 rounded-lg bg-accent/50 border whitespace-pre-wrap text-sm leading-relaxed">
            {localMessage.message}
          </div>
        </div>
      </div>

      <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
          {availableStatuses.map((status) => (
            <Button
              key={status.value}
              variant={localMessage.status === status.value ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusUpdate(status.value)}
              disabled={updatingStatus || localMessage.status === status.value}
              className="w-full sm:w-auto"
            >
              {updatingStatus && localMessage.status !== status.value ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : (
                status.label
              )}
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap justify-end">
          <Button variant="outline" onClick={() => copyToClipboard(localMessage.message, "message")} disabled={updatingStatus}>
            {copied === "message" ? (
              <>
                <Check className="size-4 mr-2" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4 mr-2" aria-hidden="true" />
                Copy Message
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}

export function ContactMessageDetailsDialog({ open, onClose, message, onStatusUpdate }: ContactMessageDetailsDialogProps) {
  if (!message) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <ContactMessageDetailsDialogContent key={message.id} message={message} onClose={onClose} onStatusUpdate={onStatusUpdate} />
    </Dialog>
  );
}