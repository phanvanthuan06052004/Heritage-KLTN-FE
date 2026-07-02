import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'heritage-admin-theme'

const readStoredTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyThemeClass = (theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  root.dataset.adminTheme = theme
}

/**
 * Admin-only theme controller.
 *
 * Toggles the `.dark` class on <html> while the admin layout is mounted, and
 * restores the previous state on unmount so client pages keep their own theme.
 */
export const useAdminTheme = () => {
  const [theme, setTheme] = useState(() => readStoredTheme())

  useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null
    const hadDark = root ? root.classList.contains('dark') : false
    applyThemeClass(theme)
    return () => {
      if (!root) return
      if (hadDark) root.classList.add('dark')
      else root.classList.remove('dark')
      delete root.dataset.adminTheme
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    applyThemeClass(theme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}

export default useAdminTheme
