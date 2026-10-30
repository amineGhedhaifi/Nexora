import {
  Mail,
  User,
  Calendar,
  Tag,
  Copy,
  Check,
  MailCheck,
  MailX,
  Archive,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { adminContactService } from "@/services/admin-contact.service";
import type {
  ContactMessage,
  ContactMessageStatus,
  ContactTopic,
} from "@/types/contact";

const topicLabels: Record<ContactTopic, string> = {
  GENERAL_INQUIRY: "General Inquiry",
  PRODUCT_QUESTION: "Product Question",
  ORDER_SUPPORT: "Order Support",
  SHIPPING_DELIVERY: "Shipping & Delivery",
  RETURNS_REFUNDS: "Returns & Refunds",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
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

// `short` is shown on narrow screens where three buttons share one row.
const availableStatuses: {
  value: ContactMessageStatus;
  label: string;
  short: string;
}[] = [
  { value: "UNREAD", label: "Mark as Unread", short: "Unread" },
  { value: "READ", label: "Mark as Read", short: "Read" },
  { value: "RESOLVED", label: "Mark as Resolved", short: "Resolved" },
];

const fieldLabel =
  "text-xs font-medium text-muted-foreground uppercase tracking-wider";

interface ContactMessageDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  message: ContactMessage | null;
  onStatusUpdate?: (message: ContactMessage) => void;
}

function ContactMessageDetailsDialogContent({
  message,
  onStatusUpdate,
}: {
  message: ContactMessage;
  onStatusUpdate?: (message: ContactMessage) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [updatingTo, setUpdatingTo] = useState<ContactMessageStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<ContactMessage>(message);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatingStatus = updatingTo !== null;
  const config = statusConfig[localMessage.status];

  // Clear the "Copied" timer if the dialog closes before it fires.
  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard is unavailable on insecure origins and some mobile webviews.
      setError(
        "Couldn't copy to the clipboard. Select the text and copy it manually.",
      );
    }
  };

  const handleStatusUpdate = async (status: ContactMessageStatus) => {
    if (updatingStatus || localMessage.status === status) return;
    setUpdatingTo(status);
    setError(null);
    try {
      const updatedMessage =
        await adminContactService.updateContactMessageStatus(localMessage.id, {
          status,
        });
      setLocalMessage(updatedMessage);
      onStatusUpdate?.(updatedMessage);
    } catch {
      setError("Couldn't update the status. Try again.");
    } finally {
      setUpdatingTo(null);
    }
  };

  return (
    // p-0 / gap-0: header, scrolling body and footer manage their own spacing.
    <DialogContent className="flex w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden p-0 max-h-[92dvh] sm:w-full sm:max-w-2xl sm:max-h-[90vh]">
      <DialogHeader className="shrink-0 space-y-1 p-4 pr-12 text-left sm:p-6 sm:pr-14">
        <DialogTitle className="flex flex-wrap items-center gap-2">
          Message Details
          <Badge variant={config.variant} className="shrink-0 gap-1">
            {config.icon}
            {config.label}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Received on {formatDate(localMessage.createdAt.split("T")[0])}
        </DialogDescription>
      </DialogHeader>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto border-y p-4 sm:p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <dt className={fieldLabel}>Customer Name</dt>
            <dd className="flex items-center gap-2">
              <User
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="min-w-0 break-words font-medium">
                {localMessage.name}
              </span>
            </dd>
          </div>

          <div className="min-w-0 space-y-1.5">
            <dt className={fieldLabel}>Email</dt>
            <dd className="flex items-center gap-2">
              <Mail
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {/* Opens the mail app (useful on phones); copying has its own button. */}
              <a
                href={`mailto:${localMessage.email}`}
                className="min-w-0 flex-1 break-all text-sm underline-offset-4 hover:underline sm:text-base"
              >
                {localMessage.email}
              </a>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                onClick={() => copyToClipboard(localMessage.email, "email")}
                aria-label="Copy email"
              >
                {copied === "email" ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </dd>
          </div>

          <div className="min-w-0 space-y-1.5">
            <dt className={fieldLabel}>Topic</dt>
            <dd className="flex items-center gap-2">
              <Tag
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <Badge variant="outline" className="whitespace-normal text-left">
                {topicLabels[localMessage.topic]}
              </Badge>
            </dd>
          </div>

          <div className="min-w-0 space-y-1.5">
            <dt className={fieldLabel}>Submitted</dt>
            <dd className="flex items-center gap-2">
              <Calendar
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <time
                dateTime={localMessage.createdAt}
                className="text-sm sm:text-base"
              >
                {new Date(localMessage.createdAt).toLocaleString()}
              </time>
            </dd>
          </div>
        </dl>

        <section
          className="space-y-2 border-t pt-4"
          aria-labelledby="contact-message-label"
        >
          <h3 id="contact-message-label" className={fieldLabel}>
            Message
          </h3>
          <div className="whitespace-pre-wrap break-words rounded-lg border bg-accent/50 p-3 text-sm leading-relaxed sm:p-4">
            {localMessage.message}
          </div>
        </section>
      </div>

      {/* Footer stays pinned while the body scrolls */}
      <DialogFooter className="shrink-0 flex-col items-stretch gap-3 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6 sm:pb-6">
        {error && (
          <p role="alert" className="text-sm text-destructive sm:hidden">
            {error}
          </p>
        )}

        <div className="space-y-2 sm:space-y-0">
          <p
            className="text-xs text-muted-foreground sm:sr-only"
            id="contact-status-label"
          >
            Set status
          </p>
          <div
            role="group"
            aria-labelledby="contact-status-label"
            className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"
          >
            {availableStatuses.map((status) => {
              const isCurrent = localMessage.status === status.value;
              const isUpdating = updatingTo === status.value;
              return (
                <Button
                  key={status.value}
                  variant={isCurrent ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleStatusUpdate(status.value)}
                  disabled={updatingStatus || isCurrent}
                  aria-pressed={isCurrent}
                  className="h-10 px-2 sm:h-9 sm:px-3"
                >
                  {isUpdating ? (
                    <>
                      <Loader2
                        className="mr-1.5 size-4 animate-spin"
                        aria-hidden="true"
                      />
                      <span className="sm:hidden">Saving</span>
                      <span className="hidden sm:inline">Updating...</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">{status.short}</span>
                      <span className="hidden sm:inline">{status.label}</span>
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {error && (
            <p
              role="alert"
              className="hidden text-sm text-destructive sm:block"
            >
              {error}
            </p>
          )}
          <Button
            variant="outline"
            onClick={() => copyToClipboard(localMessage.message, "message")}
            className="h-11 w-full sm:h-10 sm:w-auto"
          >
            {copied === "message" ? (
              <>
                <Check className="mr-2 size-4" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" aria-hidden="true" />
                Copy Message
              </>
            )}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}

export function ContactMessageDetailsDialog({
  open,
  onClose,
  message,
  onStatusUpdate,
}: ContactMessageDetailsDialogProps) {
  if (!message) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      {/* key resets local state when a different message is opened */}
      <ContactMessageDetailsDialogContent
        key={message.id}
        message={message}
        onStatusUpdate={onStatusUpdate}
      />
    </Dialog>
  );
}
