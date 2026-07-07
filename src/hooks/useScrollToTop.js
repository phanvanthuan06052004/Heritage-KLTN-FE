import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Routes where scroll-to-top should be skipped (fullscreen map pages)
const SKIP_SCROLL_ROUTES = ['/explore']

export function useScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (SKIP_SCROLL_ROUTES.some(route => pathname.startsWith(route))) return

    // Scroll both window and document element to cover all container types
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    } catch {
      window.scrollTo(0, 0)
    }
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])
}

