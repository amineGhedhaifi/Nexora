import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  /** Must match the id of the input inside. The error element gets `${htmlFor}-error`. */
  htmlFor: string
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, error, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
