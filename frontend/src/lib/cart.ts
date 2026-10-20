import type { CartItem, CartProductInput, CartTotals } from "@/types/cart";
import type { Product } from "@/types/product";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QTY_PER_ITEM,
  SHIPPING_FLAT_RATE,
} from "./constants";

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** The most units a customer can add: limited by stock and by MAX_QTY_PER_ITEM. */
export function getMaxQuantity(stock: number): number {
  return Math.max(0, Math.min(Math.floor(stock), MAX_QTY_PER_ITEM));
}

export function clampQuantity(quantity: number, stock: number): number {
  const max = getMaxQuantity(stock);
  return Math.min(Math.max(Math.floor(quantity), 1), max);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FLAT_RATE;
}

export function amountToFreeShipping(subtotal: number): number {
  return Math.max(0, roundMoney(FREE_SHIPPING_THRESHOLD - subtotal));
}

export function calculateTotals(items: CartItem[]): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const shipping = calculateShipping(subtotal);
  return {
    itemCount,
    subtotal,
    shipping,
    total: roundMoney(subtotal + shipping),
  };
}

export function toCartProduct(product: Product): CartProductInput {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? null,
    stock: product.stock,
  };
}
