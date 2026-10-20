import { Link } from "react-router-dom"
import { LifeBuoy, RotateCcw, Truck, Zap } from "lucide-react"
import { Logo } from "@/components/shared/Logo"
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants"
import { formatPrice } from "@/lib/format"
import { accountLinks, companyLinks, shopLinks, type NavLinkItem } from "@/lib/navigation"
import { NewsletterForm } from "./NewsletterForm"

const trustPoints = [
  { icon: Truck, title: "Free shipping", text: `On orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` },
  { icon: RotateCcw, title: "Easy returns", text: "30 days to change your mind" },
  { icon: Zap, title: "Order in minutes", text: "No account needed" },
  { icon: LifeBuoy, title: "Friendly support", text: "We reply within one business day" },
]

function LinkGroup({ title, links }: { title: string; links: NavLinkItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <Link
              to={link.to}
              className="text-sm text-muted-foreground transition-colors hover:text-link"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="page-container">
        {/* Trust strip */}
        <ul className="grid grid-cols-2 gap-6 border-b py-10 lg:grid-cols-4">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Brand, newsletter, links */}
        <div className="grid gap-12 py-12 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              Quality everyday products from electronics to home essentials, delivered to your door.
            </p>
            <NewsletterForm />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:pl-8">
            <LinkGroup title="Shop" links={shopLinks} />
            <LinkGroup title="Company" links={companyLinks} />
            <LinkGroup title="Account" links={accountLinks} />
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Nexora. All rights reserved.</p>
          <p>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
        </div>
      </div>
    </footer>
  )
}
