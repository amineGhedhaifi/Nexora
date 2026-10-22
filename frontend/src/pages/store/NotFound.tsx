import { Link, useLocation } from "react-router-dom"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <section className="page-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <p className="text-7xl font-bold tracking-tight text-link sm:text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">We can't find that page</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for may have moved, or the link might be broken.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={isAdminRoute ? "/admin" : "/"} className={buttonVariants({ size: "lg" })}>
            {isAdminRoute ? "Back to dashboard" : "Back to home"}
          </Link>
        </div>
      </div>
    </section>
  )
}