import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const benefits = [
  "Follow every order from one place",
  "Faster checkout with your details saved",
  "Shopping as a guest always stays an option",
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-primary to-primary-hover p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-16 size-96 rounded-full bg-black/10 blur-3xl"
        />

        <Link
          to="/"
          className="relative inline-flex items-center gap-2 text-xl font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-lg bg-primary-foreground text-primary"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 19V5l12 14V5" />
            </svg>
          </span>
          Nexora
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold tracking-tight text-balance">
            Shopping that stays out of your way.
          </h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-foreground/20">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/80">
          &copy; {new Date().getFullYear()} Nexora
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-link"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to store
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <Logo className="mb-8 lg:hidden" />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
