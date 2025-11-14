/**
 * Analytics Server Actions
 * Server-side functions for tracking analytics events
 * Following CLAUDE.md best practices: Zod validation, Server Actions, error handling
 */

'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import {
  trackPageViewSchema,
  trackProductClickSchema,
  trackLeadSubmissionSchema,
  trackPurchaseSchema,
  createSessionSchema,
  type TrackPageViewInput,
  type TrackProductClickInput,
  type TrackLeadSubmissionInput,
  type TrackPurchaseInput,
  type CreateSessionInput,
  type Response,
} from './schemas'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { ZodError } from 'zod'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Hash IP address for privacy-friendly storage
 */
function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

/**
 * Handle errors in analytics functions
 */
function handleAnalyticsError(error: unknown, defaultMessage: string): { success: false; error: string } {
  if (error instanceof ZodError) {
    return {
      success: false,
      error: error.issues[0].message,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: false,
    error: defaultMessage,
  }
}

/**
 * Get IP address from request headers
 */
async function getIpAddress(): Promise<string | undefined> {
  const headersList = await headers()
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  return realIp || undefined
}

/**
 * Get user agent from request headers
 */
async function getUserAgent(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('user-agent') || undefined
}

/**
 * Get or create a session for tracking
 */
export async function getOrCreateSession(
  input: CreateSessionInput
): Promise<Response<{ sessionId: string }>> {
  try {
    // Validate input
    const validatedData = createSessionSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get IP and user agent from headers
    const ip = await getIpAddress()
    const userAgent = await getUserAgent()
    const ipHash = ip ? hashIp(ip) : undefined

    // Create new session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        store_id: validatedData.storeId,
        referrer: validatedData.referrer,
        utm_source: validatedData.utm_source,
        utm_medium: validatedData.utm_medium,
        utm_campaign: validatedData.utm_campaign,
        utm_content: validatedData.utm_content,
        utm_term: validatedData.utm_term,
        user_agent: userAgent,
        ip_hash: ipHash,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return {
        success: false,
        error: 'Failed to create session',
      }
    }

    return {
      success: true,
      data: { sessionId: session.id },
    }
  } catch (error: unknown) {
    console.error('Error in getOrCreateSession:', error)
    return handleAnalyticsError(error, 'An unexpected error occurred while creating session')
  }
}

// ============================================================================
// TRACK PAGE VIEW
// ============================================================================

export async function trackPageView(
  input: TrackPageViewInput
): Promise<Response> {
  try {
    // Validate input
    const validatedData = trackPageViewSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get IP and user agent from headers if not provided
    const ip = await getIpAddress()
    const userAgent = validatedData.userAgent || await getUserAgent()
    const ipHash = ip ? hashIp(ip) : undefined

    // Insert page view event
    const { error } = await supabase.from('events').insert({
      store_id: validatedData.storeId,
      session_id: validatedData.sessionId,
      event_type: 'page_view',
      referrer: validatedData.referrer,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
      user_agent: userAgent,
      ip_hash: ipHash,
    })

    if (error) {
      console.error('Error tracking page view:', error)
      return {
        success: false,
        error: 'Failed to track page view',
      }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error in trackPageView:', error)
    return handleAnalyticsError(error, 'An unexpected error occurred while tracking page view')
  }
}

// ============================================================================
// TRACK PRODUCT CLICK
// ============================================================================

export async function trackProductClick(
  input: TrackProductClickInput
): Promise<Response> {
  try {
    // Validate input
    const validatedData = trackProductClickSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get IP and user agent from headers if not provided
    const ip = await getIpAddress()
    const userAgent = validatedData.userAgent || await getUserAgent()
    const ipHash = ip ? hashIp(ip) : undefined

    // Verify session exists if sessionId is provided
    let sessionId = validatedData.sessionId
    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .single()

      // If session doesn't exist, don't pass it
      if (!session) {
        sessionId = undefined
      }
    }

    // Insert product click event
    const { error } = await supabase.from('events').insert({
      store_id: validatedData.storeId,
      product_id: validatedData.productId,
      session_id: sessionId || null,
      event_type: 'product_click',
      referrer: validatedData.referrer,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
      user_agent: userAgent,
      ip_hash: ipHash,
    })

    if (error) {
      console.error('Error tracking product click:', error)
      return {
        success: false,
        error: 'Failed to track product click',
      }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error in trackProductClick:', error)
    return handleAnalyticsError(error, 'An unexpected error occurred while tracking product click')
  }
}

// ============================================================================
// TRACK LEAD SUBMISSION
// ============================================================================

export async function trackLeadSubmission(
  input: TrackLeadSubmissionInput
): Promise<Response> {
  try {
    // Validate input
    const validatedData = trackLeadSubmissionSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get IP and user agent from headers if not provided
    const ip = await getIpAddress()
    const userAgent = validatedData.userAgent || await getUserAgent()
    const ipHash = ip ? hashIp(ip) : undefined

    // Prepare event data
    const eventData = {
      email: validatedData.email,
      fullName: validatedData.fullName,
      phoneNumber: validatedData.phoneNumber,
    }

    // Verify session exists if sessionId is provided
    let sessionId = validatedData.sessionId
    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .single()

      // If session doesn't exist, don't pass it
      if (!session) {
        sessionId = undefined
      }
    }

    // Insert lead submission event
    const { error } = await supabase.from('events').insert({
      store_id: validatedData.storeId,
      product_id: validatedData.productId,
      session_id: sessionId || null,
      event_type: 'lead_submit',
      event_data: eventData,
      referrer: validatedData.referrer,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
      user_agent: userAgent,
      ip_hash: ipHash,
    })

    if (error) {
      console.error('Error tracking lead submission:', error)
      return {
        success: false,
        error: 'Failed to track lead submission',
      }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error in trackLeadSubmission:', error)
    return handleAnalyticsError(error, 'An unexpected error occurred while tracking lead submission')
  }
}

// ============================================================================
// TRACK PURCHASE
// ============================================================================

export async function trackPurchase(
  input: TrackPurchaseInput
): Promise<Response> {
  try {
    // Validate input
    const validatedData = trackPurchaseSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get IP and user agent from headers if not provided
    const ip = await getIpAddress()
    const userAgent = validatedData.userAgent || await getUserAgent()
    const ipHash = ip ? hashIp(ip) : undefined

    // Prepare event data
    const eventData = {
      amount: validatedData.amount,
      currency: validatedData.currency,
      customerEmail: validatedData.customerEmail,
      customerName: validatedData.customerName,
    }

    // Insert purchase event
    const { error } = await supabase.from('events').insert({
      store_id: validatedData.storeId,
      product_id: validatedData.productId,
      session_id: validatedData.sessionId,
      event_type: 'purchase',
      event_data: eventData,
      referrer: validatedData.referrer,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
      user_agent: userAgent,
      ip_hash: ipHash,
    })

    if (error) {
      console.error('Error tracking purchase:', error)
      return {
        success: false,
        error: 'Failed to track purchase',
      }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error in trackPurchase:', error)
    return handleAnalyticsError(error, 'An unexpected error occurred while tracking purchase')
  }
}

// ============================================================================
// FETCH ANALYTICS DATA
// ============================================================================

import {
  getTimeSeriesData,
  getComparisonMetrics,
  getTopProductsByClicks,
  getTrafficSources,
} from './queries'
import { getPreviousPeriod } from './date-utils'
import type { MetricType } from './types'

import { getCachedAnalytics, getAnalyticsCacheKey } from '@/lib/cache/redis'

export async function fetchAnalyticsData(
  storeId: string,
  startDate: Date,
  endDate: Date,
  metric: MetricType
) {
  try {
    const { startDate: previousStartDate, endDate: previousEndDate } = getPreviousPeriod(
      startDate,
      endDate
    )

    const dateRange = `${startDate.toISOString()}_${endDate.toISOString()}`
    const cacheKey = getAnalyticsCacheKey(storeId, dateRange, metric)

    const [timeSeriesData, comparisonMetrics, topProducts, trafficSourcesResult] =
      await getCachedAnalytics(
        cacheKey,
        async () => {
          return await Promise.all([
            getTimeSeriesData(storeId, startDate, endDate, metric),
            getComparisonMetrics(storeId, startDate, endDate, previousStartDate, previousEndDate),
            getTopProductsByClicks(storeId, startDate, endDate, 10),
            getTrafficSources(storeId, {
              from: startDate.toISOString(),
              to: endDate.toISOString(),
            }),
          ])
        },
        300
      )

    const trafficSources = trafficSourcesResult.success && trafficSourcesResult.data
      ? trafficSourcesResult.data.map((source) => ({
          source: source.source,
          visits: source.views,
          percentage: 0,
          utmSource: source.source,
          utmMedium: source.medium,
        }))
      : []

    const totalVisits = trafficSources.reduce((sum, source) => sum + source.visits, 0)
    trafficSources.forEach((source) => {
      source.percentage = totalVisits > 0 ? (source.visits / totalVisits) * 100 : 0
    })

    return {
      timeSeriesData,
      comparisonMetrics,
      topProducts,
      trafficSources,
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw error
  }
}
