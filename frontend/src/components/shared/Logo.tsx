import { Link } from "react-router-dom"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${APP_NAME} home`}
      className={cn("inline-flex items-center gap-2 rounded-lg", className)}
    >
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm"
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
      <span className="text-lg font-bold tracking-tight">{APP_NAME}</span>
    </Link>
  )
}
