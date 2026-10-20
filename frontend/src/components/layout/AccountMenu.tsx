import { Link, useNavigate } from "react-router-dom"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { LogOut, Package, User as UserIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Desktop account control: a sign-in icon, or the user's menu once signed in. */
export function AccountMenu() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  // Reserve the space while the session is restored so the navbar doesn't jump
  if (isLoading) return <span aria-hidden="true" className="hidden size-10 lg:block" />

  if (!user) {
    return (
      <Link
        to="/login"
        aria-label="Sign in"
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden lg:inline-flex")}
      >
        <UserIcon className="size-5" />
      </Link>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="hidden size-10 place-items-center rounded-full transition-colors hover:bg-accent lg:grid"
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(user.name)}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          className="z-50 w-60 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link to="/orders" className={itemClass}>
              <Package className="size-4" aria-hidden="true" />
              My orders
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={itemClass}
            onSelect={async () => {
              await logout()
              navigate("/")
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
