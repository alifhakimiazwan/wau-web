/**
 * Lead Capture Validation Schemas
 * Zod schemas for validating lead magnet submissions
 * Following CLAUDE.md best practices for input validation
 */

import { z } from 'zod'
import { utmParamsSchema } from '@/lib/analytics/schemas'

// ============================================================================
// LEAD CAPTURE SUBMISSION SCHEMA
// ============================================================================

export const leadCaptureSubmissionSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  productId: z.string().uuid('Invalid product ID'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Name is required').nullable().optional().transform(val => val || undefined),
  phoneNumber: z.string().min(1, 'Phone number is required').nullable().optional().transform(val => val || undefined),
  sessionId: z.string().uuid('Invalid session ID').nullable().optional().transform(val => val || undefined),
  referrer: z.string().nullable().optional().transform(val => val || undefined),
  userAgent: z.string().nullable().optional().transform(val => val || undefined),
  ipHash: z.string().nullable().optional().transform(val => val || undefined),
}).merge(utmParamsSchema)

export type LeadCaptureSubmissionInput = z.infer<typeof leadCaptureSubmissionSchema>

// ============================================================================
// RETRY EMAIL SCHEMA
// ============================================================================

export const retryFreebieEmailSchema = z.object({
  leadCaptureId: z.string().uuid('Invalid lead capture ID'),
})

export type RetryFreebieEmailInput = z.infer<typeof retryFreebieEmailSchema>

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type SuccessResponse<T = unknown> = {
  success: true
  data?: T
}

export type ErrorResponse = {
  success: false
  error: string
}

export type Response<T = unknown> = SuccessResponse<T> | ErrorResponse
