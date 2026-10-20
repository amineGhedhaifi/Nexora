import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { THEME_STORAGE_KEY } from "@/lib/constants"
import { ThemeContext, type ResolvedTheme, type Theme } from "./theme-context"

const DARK_QUERY = "(prefers-color-scheme: dark)"

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    // storage unavailable (private mode, blocked): fall back to system
  }
  return "system"
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemTheme : theme

  // Follow OS-level changes while the user is on "system"
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const onChange = () => setSystemTheme(media.matches ? "dark" : "light")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  // Apply the class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
  }, [resolvedTheme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // ignore: the choice still applies for this session
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}