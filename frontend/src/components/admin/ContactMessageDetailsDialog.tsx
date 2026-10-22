import { X, Mail, User, Calendar, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

type ContactTopic = "GENERAL_INQUIRY" | "PRODUCT_QUESTION" | "ORDER_SUPPORT" | "SHIPPING_DELIVERY" | "RETURNS_REFUNDS" | "TECHNICAL_ISSUE" | "OTHER";

const topicLabels: Record<ContactTopic, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  PRODUCT_QUESTION: "Product Question",
  ORDER_SUPPORT: "Order Support",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_REFUNDS: "Returns & Refunds",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
};

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  createdAt: string;
  read: boolean;
}

interface ContactMessageDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  message: ContactMessage | null;
}

export function ContactMessageDetailsDialog({ open, onClose, message }: ContactMessageDetailsDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!message) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2">
                Message Details
                {!message.read && <Badge variant="default" className="ml-2">Unread</Badge>}
              </DialogTitle>
              <DialogDescription>Received on {formatDate(message.createdAt.split("T")[0])}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 border-y">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</label>
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">{message.name}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" aria-hidden="true" />
                <a
                  href={`mailto:${message.email}`}
                  className="hover:underline"
                  onClick={(e) => { e.preventDefault(); copyToClipboard(message.email, "email"); }}
                >
                  {message.email}
                </a>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => copyToClipboard(message.email, "email")}
                  aria-label="Copy email"
                >
                  {copied === "email" ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Topic</label>
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
                <Badge variant="secondary">{topicLabels[message.topic]}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</label>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" aria-hidden="true" />
                <p>{new Date(message.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</label>
            <div className="p-4 rounded-lg bg-accent/50 border whitespace-pre-wrap text-sm leading-relaxed">
              {message.message}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(message.message, "message")}
          >
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}