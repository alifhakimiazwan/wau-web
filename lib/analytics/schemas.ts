/**
 * Analytics Validation Schemas
 * Zod schemas for validating analytics event data
 * Following CLAUDE.md best practices for input validation
 */

import { z } from 'zod'

// ============================================================================
// UTM PARAMETERS SCHEMA
// ============================================================================

export const utmParamsSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
})

export type UtmParams = z.infer<typeof utmParamsSchema>

// ============================================================================
// SESSION DATA SCHEMA
// ============================================================================

export const sessionDataSchema = z.object({
  sessionId: z.string().uuid().optional(),
  storeId: z.string().uuid(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type SessionData = z.infer<typeof sessionDataSchema>

// ============================================================================
// PAGE VIEW EVENT SCHEMA
// ============================================================================

export const trackPageViewSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  sessionId: z.string().uuid('Invalid session ID').optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type TrackPageViewInput = z.infer<typeof trackPageViewSchema>

// ============================================================================
// PRODUCT CLICK EVENT SCHEMA
// ============================================================================

export const trackProductClickSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  productId: z.string().uuid('Invalid product ID'),
  sessionId: z.string().uuid('Invalid session ID').optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type TrackProductClickInput = z.infer<typeof trackProductClickSchema>

// ============================================================================
// LEAD SUBMISSION EVENT SCHEMA
// ============================================================================

export const trackLeadSubmissionSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  productId: z.string().uuid('Invalid product ID'),
  sessionId: z.string().uuid('Invalid session ID').optional(),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type TrackLeadSubmissionInput = z.infer<typeof trackLeadSubmissionSchema>

// ============================================================================
// PURCHASE EVENT SCHEMA
// ============================================================================

export const trackPurchaseSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  productId: z.string().uuid('Invalid product ID'),
  sessionId: z.string().uuid('Invalid session ID').optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('MYR'),
  customerEmail: z.string().email('Invalid email address'),
  customerName: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type TrackPurchaseInput = z.infer<typeof trackPurchaseSchema>

// ============================================================================
// CREATE SESSION SCHEMA
// ============================================================================

export const createSessionSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipHash: z.string().optional(),
}).merge(utmParamsSchema)

export type CreateSessionInput = z.infer<typeof createSessionSchema>

// ============================================================================
// EVENT DATA SCHEMAS (for event_data JSONB field)
// ============================================================================

// Event data for purchase events
export const purchaseEventDataSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('MYR'),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
})

export type PurchaseEventData = z.infer<typeof purchaseEventDataSchema>

// Event data for lead submission events
export const leadSubmissionEventDataSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
})

export type LeadSubmissionEventData = z.infer<typeof leadSubmissionEventDataSchema>

// ============================================================================
// ANALYTICS QUERY SCHEMAS
// ============================================================================

export const dateRangeSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid start date format',
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid end date format',
  }),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Start date must be before end date',
})

export type DateRange = z.infer<typeof dateRangeSchema>

export const getStoreAnalyticsSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  dateRange: dateRangeSchema.optional(),
})

export type GetStoreAnalyticsInput = z.infer<typeof getStoreAnalyticsSchema>

export const getProductAnalyticsSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  dateRange: dateRangeSchema.optional(),
})

export type GetProductAnalyticsInput = z.infer<typeof getProductAnalyticsSchema>

// ============================================================================
// HELPER SCHEMAS
// ============================================================================

// Event type enum
export const eventTypeSchema = z.enum(['page_view', 'product_click', 'lead_submit', 'purchase'])

export type EventType = z.infer<typeof eventTypeSchema>

// Success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
})

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
})

// Generic response schema
export const responseSchema = z.discriminatedUnion('success', [
  successResponseSchema,
  errorResponseSchema,
])

export type SuccessResponse<T = unknown> = {
  success: true
  data?: T
}

export type ErrorResponse = {
  success: false
  error: string
}

export type Response<T = unknown> = SuccessResponse<T> | ErrorResponse
