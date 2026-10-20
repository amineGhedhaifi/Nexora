import { useId, useState, type FormEvent } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false)
  const inputId = useId()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    // Mock for now: later this calls a newsletter service (POST /api/newsletter)
    setSubscribed(true)
  }

  if (subscribed) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm font-medium text-success">
        <Check className="size-4" aria-hidden="true" />
        Thanks for subscribing. Look out for our next update.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        New arrivals and offers, once a week
      </label>
      <div className="flex max-w-md gap-2">
        <Input id={inputId} type="email" required autoComplete="email" placeholder="you@example.com" />
        <Button type="submit">Subscribe</Button>
      </div>
    </form>
  )
}
