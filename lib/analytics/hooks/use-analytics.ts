/**
 * Client-Side Analytics Hook
 * Extracts UTM parameters, manages sessions, and provides analytics context
 * Client-side only hook
 */

'use client'

import { useEffect, useState } from 'react'
import { getOrCreateSession } from '../actions'
import type { UtmParams } from '../schemas'

// Cookie helpers
const COOKIE_NAME = 'wau_session_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

/**
 * Set cookie
 */
function setCookie(name: string, value: string, maxAge: number) {
  if (typeof window === 'undefined') return

  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`
}

/**
 * Extract UTM parameters from URL
 */
export function extractUtmParams(): UtmParams {
  if (typeof window === 'undefined') {
    return {}
  }

  const params = new URLSearchParams(window.location.search)

  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  }
}

/**
 * Get referrer from document
 */
export function getReferrer(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return document.referrer || undefined
}

/**
 * Analytics session data
 */
export interface AnalyticsSession {
  sessionId: string | null
  storeId: string
  utmParams: UtmParams
  referrer: string | undefined
  isLoading: boolean
}

/**
 * Hook to manage analytics session
 */
export function useAnalytics(storeId: string): AnalyticsSession {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [utmParams] = useState<UtmParams>(() => extractUtmParams())
  const [referrer] = useState<string | undefined>(() => getReferrer())

  useEffect(() => {
    async function initializeSession() {
      try {
        // Check if session ID exists in cookie
        const existingSessionId = getCookie(COOKIE_NAME)

        if (existingSessionId) {
          setSessionId(existingSessionId)
          setIsLoading(false)
          return
        }

        // Create new session
        const result = await getOrCreateSession({
          storeId,
          referrer,
          ...utmParams,
        })

        if (result.success && result.data) {
          const newSessionId = result.data.sessionId
          setSessionId(newSessionId)
          // Store in cookie for 30 days
          setCookie(COOKIE_NAME, newSessionId, COOKIE_MAX_AGE)
        }
      } catch (error) {
        console.error('Error initializing analytics session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [storeId, referrer, utmParams])

  return {
    sessionId,
    storeId,
    utmParams,
    referrer,
    isLoading,
  }
}
