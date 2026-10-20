import { getApiOrigin } from "@/services/api";

/**
 * Turns the image path stored by the API (e.g. "/uploads/products/x.webp")
 * into a full URL. Absolute URLs are returned untouched. The stored path is
 * never modified, so the database stays as it is.
 */
export function resolveImageUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  const trimmed = path.trim();
  if (!trimmed) return null;

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:"))
    return trimmed;

  // origin + exactly one slash + path (an empty origin gives a same-origin "/uploads/..." URL)
  return `${getApiOrigin()}/${trimmed.replace(/^\/+/, "")}`;
}
