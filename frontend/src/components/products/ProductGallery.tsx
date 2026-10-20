import { useState } from "react"
import { CategoryIcon } from "@/components/shared/CategoryIcon"
import { ProductImage } from "@/components/shared/ProductImage"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  name: string
  /** Category slug, used for the placeholder icon. */
  category: string
}

export function ProductGallery({ images, name, category }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [origin, setOrigin] = useState("50% 50%")
  const current = images[selected]

  const placeholder = (
    <div className="grid size-full place-items-center bg-linear-to-br from-accent via-muted to-secondary">
      <div className="text-center text-primary/40">
        <CategoryIcon slug={category} className="mx-auto size-28" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">Photo coming soon</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div
        className="group relative aspect-square overflow-hidden rounded-3xl border bg-muted"
        onPointerMove={(event) => {
          // Zoom follows the cursor (only visible on devices with a mouse)
          const rect = event.currentTarget.getBoundingClientRect()
          const x = ((event.clientX - rect.left) / rect.width) * 100
          const y = ((event.clientY - rect.top) / rect.height) * 100
          setOrigin(`${x}% ${y}%`)
        }}
      >
        <ProductImage
          src={current}
          alt={`${name}, image ${selected + 1} of ${images.length}`}
          loading="eager"
          fallback={placeholder}
          style={{ transformOrigin: origin }}
          className="size-full object-cover transition-transform duration-200 [@media(pointer:fine)]:group-hover:scale-150"
        />
      </div>

      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-3">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-pressed={index === selected}
                onClick={() => setSelected(index)}
                className={cn(
                  "aspect-square w-full overflow-hidden rounded-xl border-2 bg-muted transition-colors",
                  index === selected ? "border-primary" : "border-transparent hover:border-border",
                )}
              >
                <ProductImage
                  src={src}
                  className="size-full object-cover"
                  fallback={<span className="block size-full bg-muted" />}
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
