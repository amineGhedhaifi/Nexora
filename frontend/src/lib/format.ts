import { CURRENCY, LOCALE } from "./constants"

// Amounts are plain numbers in major units (e.g. 19.99 = $19.99).
const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
})

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatPrice(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount)
}

export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value)
}

export function formatDate(
  input: string | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  const date = typeof input === "string" ? new Date(input) : input
  return new Intl.DateTimeFormat(LOCALE, options).format(date)
}

/** Percentage off, rounded. Returns 0 when there is no discount. */
export function getDiscountPercent(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}