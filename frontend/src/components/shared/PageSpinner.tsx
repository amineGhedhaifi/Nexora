import { Loader2 } from "lucide-react"

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="grid min-h-[40vh] place-items-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
