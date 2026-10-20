import { Link, NavLink } from "react-router-dom"
import { Drawer } from "@/components/ui/drawer"
import { buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { mainNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const close = () => onOpenChange(false)

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="left"
      title="Menu"
      description="Browse Nexora's pages."
      className="max-w-xs"
    >
      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-3">
        <ul className="space-y-1">
          {mainNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    "flex rounded-lg px-3 py-3 text-base font-medium transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent",
                  )
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3 border-t p-4">
        <div className="grid grid-cols-2 gap-2">
          <Link to="/login" onClick={close} className={buttonVariants({ variant: "outline" })}>
            Sign in
          </Link>
          <Link to="/register" onClick={close} className={buttonVariants()}>
            Create account
          </Link>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </Drawer>
  )
}