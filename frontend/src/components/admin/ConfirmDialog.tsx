import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle className="text-left text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left text-sm">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row-reverse gap-3">
          <Button variant="outline" onClick={onClose} disabled={open === false} className="w-full sm:w-auto">
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "primary"}
            onClick={onConfirm}
            autoFocus
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}