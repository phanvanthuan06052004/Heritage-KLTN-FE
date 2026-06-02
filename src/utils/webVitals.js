/**
 * Reports Core Web Vitals using the `web-vitals` library.
 *
 * LCP, CLS, INP, FCP, TTFB are logged to console in development
 * and can be sent to an analytics endpoint in production.
 */
export async function reportWebVitals() {
  if (typeof window === 'undefined') return

  try {
    const { onLCP, onCLS, onINP, onFCP, onTTFB } = await import('web-vitals')

    const logMetric = (metric) => {
      if (import.meta.env.DEV) {
        console.info(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
      }

      // Send to analytics in production
      if (import.meta.env.PROD) {
        const body = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          url: window.location.pathname,
        }

        // Use sendBeacon for reliability, fallback to fetch
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(body))
        } else {
          fetch('/api/analytics/vitals', {
            method: 'POST',
            body: JSON.stringify(body),
            keepalive: true,
          }).catch(() => {})
        }
      }
    }

    onLCP(logMetric)
    onCLS(logMetric)
    onINP(logMetric)
    onFCP(logMetric)
    onTTFB(logMetric)
  } catch {
    // web-vitals not available
  }
}
