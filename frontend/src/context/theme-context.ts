import { createContext } from "react"

export type Theme = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export interface ThemeContextValue {
  /** What the user chose (may be "system"). */
  theme: Theme
  /** What is actually applied right now. */
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  /** Flips between light and dark (stores an explicit choice). */
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)