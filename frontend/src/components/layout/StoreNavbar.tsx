/**
 * Scroll-morph navbar. The "bar becomes a floating pill on scroll" behavior is
 * adapted from Aceternity UI's Resizable Navbar, rebuilt with Nexora's tokens,
 * React Router links and an accessible mobile menu (Radix).
 */
import { useState, type ReactNode } from "react"
import { NavLink } from "react-router-dom"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { Menu, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/Logo"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useCart } from "@/hooks/useCart"
import { mainNav } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { AccountMenu } from "./AccountMenu"
import { MobileMenu } from "./MobileMenu"

const SCROLL_THRESHOLD = 24

function DesktopLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive ? "text-foreground" : "text-muted-foreground",
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export function StoreNavbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > SCROLL_THRESHOLD,
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > SCROLL_THRESHOLD))

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-[padding] duration-300",
          scrolled ? "px-3" : "px-0",
        )}
      >
        <motion.div
          initial={false}
          animate={{
            maxWidth: scrolled ? "64rem" : "120rem",
            y: scrolled ? 12 : 0,
            borderRadius: scrolled ? "1.25rem" : "0rem",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          className={cn(
            "mx-auto w-full bg-background/85 backdrop-blur-xl",
            scrolled ? "border shadow-lg" : "border-b",
          )}
        >
          <div className={cn("flex h-16 items-center gap-2", scrolled ? "w-full px-4" : "page-container")}>
            <Logo className="shrink-0" />

            <nav aria-label="Main" className="ml-8 hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <DesktopLink key={item.to} to={item.to}>
                  {item.name}
                </DesktopLink>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle className="hidden sm:inline-flex" />

              <AccountMenu />

              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={openCart}
                aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              >
                <ShoppingBag className="size-5" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    aria-hidden="true"
                    className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </header>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  )
}
