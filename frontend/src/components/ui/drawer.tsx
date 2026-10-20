import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Read by screen readers. Falls back to the title. */
  description?: string
  side?: "left" | "right"
  className?: string
  children: ReactNode
}

/** Side panel built on Radix Dialog: focus trap, Escape to close, scroll lock, aria roles. */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  className,
  children,
}: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-background pb-[env(safe-area-inset-bottom)] shadow-xl outline-none duration-300",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            side === "right"
              ? "right-0 border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
              : "left-0 border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
            className,
          )}
        >
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close">
                <X className="size-5" />
              </Button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{description ?? title}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
