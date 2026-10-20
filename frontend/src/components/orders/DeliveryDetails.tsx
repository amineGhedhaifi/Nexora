import { cn } from "@/lib/utils"
import type { ShippingInfo } from "@/types/order"

export function DeliveryDetails({ shippingInfo, className }: { shippingInfo: ShippingInfo; className?: string }) {
  return (
    <section aria-labelledby="delivery-heading" className={cn("rounded-2xl border bg-card p-6", className)}>
      <h2 id="delivery-heading" className="text-lg font-semibold">
        Delivery details
      </h2>
      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Name</dt>
          <dd className="mt-0.5 font-medium">
            {shippingInfo.firstName} {shippingInfo.lastName}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Contact</dt>
          <dd className="mt-0.5 font-medium">{shippingInfo.email}</dd>
          <dd className="font-medium">{shippingInfo.phone}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Shipping address</dt>
          <dd className="mt-0.5 font-medium">{shippingInfo.address}</dd>
          <dd className="font-medium">
            {shippingInfo.postalCode} {shippingInfo.city}
          </dd>
          <dd className="font-medium">{shippingInfo.country}</dd>
        </div>
      </dl>
    </section>
  )
}
