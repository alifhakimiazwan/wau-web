/**
 * Analytics Provider Component
 * Wraps the storefront to provide analytics context to all components
 * Auto-tracks page views and manages session
 */

'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAnalytics, type AnalyticsSession } from '@/lib/analytics/hooks/use-analytics'
import { trackPageView } from '@/lib/analytics/actions'

// Create Analytics Context
const AnalyticsContext = createContext<AnalyticsSession | null>(null)

// Hook to use analytics context
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalyticsContext must be used within AnalyticsProvider')
  }
  return context
}

// Props for AnalyticsProvider
interface AnalyticsProviderProps {
  storeId: string
  children: ReactNode
}

/**
 * Analytics Provider Component
 * Initializes analytics session and auto-tracks page view
 */
export function AnalyticsProvider({ storeId, children }: AnalyticsProviderProps) {
  const analytics = useAnalytics(storeId)

  // Auto-track page view when session is ready
  useEffect(() => {
    if (!analytics.isLoading && analytics.sessionId) {
      trackPageView({
        storeId: analytics.storeId,
        sessionId: analytics.sessionId,
        referrer: analytics.referrer,
        ...analytics.utmParams,
      }).catch((error) => {
        console.error('Error tracking page view:', error)
      })
    }
  }, [analytics.isLoading, analytics.sessionId, analytics.storeId, analytics.referrer, analytics.utmParams])

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  )
}
