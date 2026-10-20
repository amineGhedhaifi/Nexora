import { CART_STORAGE_KEY } from "@/lib/constants";
import type { CartItem } from "@/types/cart";

/**
 * Guest cart persistence (localStorage).
 * Later, when the Express API exists: add server-side load/save for signed-in
 * users here and merge the guest cart into it on login. The UI won't change.
 */

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    (typeof item.image === "string" || item.image === null) &&
    typeof item.stock === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

export const cartService = {
  load(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
    } catch {
      return [];
    }
  },

  save(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable: the cart still works for this session
    }
  },
};
