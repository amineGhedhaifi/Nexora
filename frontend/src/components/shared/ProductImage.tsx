import { useState, type CSSProperties, type ReactNode } from "react"

interface ProductImageProps {
  src: string | null | undefined
  alt?: string
  className?: string
  style?: CSSProperties
  loading?: "lazy" | "eager"
  /** Shown when there is no image, or when it fails to load. */
  fallback: ReactNode
}

/** An <img> that falls back gracefully: the database path existing doesn't mean the file does. */
export function ProductImage({ src, alt = "", className, style, loading = "lazy", fallback }: ProductImageProps) {
  // Remember which URL failed, so a new src gets a fresh attempt
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) return <>{fallback}</>

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={className}
      style={style}
    />
  )
}
