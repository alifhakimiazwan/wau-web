'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { trackLeadSubmission } from '@/lib/analytics/actions'
import { sendFreebieEmail } from '@/lib/email/send-freebie'
import {
  leadCaptureSubmissionSchema,
  retryFreebieEmailSchema,
  type LeadCaptureSubmissionInput,
  type RetryFreebieEmailInput,
  type Response,
} from './schemas'
import { ZodError } from 'zod'
import type { LeadMagnetConfig } from '@/lib/products/types'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handle errors in lead capture functions
 */
function handleLeadCaptureError(error: unknown, defaultMessage: string): { success: false; error: string } {
  if (error instanceof ZodError) {
    // ZodError has an 'issues' array, not 'errors'
    const firstIssue = error.issues?.[0]
    return {
      success: false,
      error: firstIssue?.message || 'Validation error',
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

// ============================================================================
// SUBMIT LEAD CAPTURE
// ============================================================================

export async function submitLeadCapture(
  input: LeadCaptureSubmissionInput
): Promise<Response<{ leadCaptureId: string; emailSent: boolean }>> {
  try {
    // Validate input
    const validatedData = leadCaptureSubmissionSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get product details to access freebie config and store info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, stores!inner(name, profile_pic_url)')
      .eq('id', validatedData.productId)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      return {
        success: false,
        error: 'Product not found',
      }
    }

    // Parse product config
    const productConfig = product.type_config as unknown as LeadMagnetConfig

    // Insert lead capture record
    const { data: leadCapture, error: leadCaptureError } = await supabase
      .from('lead_captures')
      .insert({
        product_id: validatedData.productId,
        store_id: validatedData.storeId,
        email: validatedData.email,
        full_name: validatedData.fullName,
        phone_number: validatedData.phoneNumber,
        freebie_sent: false,
      })
      .select()
      .single()

    if (leadCaptureError || !leadCapture) {
      console.error('Error creating lead capture:', leadCaptureError)
      return {
        success: false,
        error: 'Failed to save your information. Please try again.',
      }
    }

    // Upsert customer record
    const { error: customerError } = await supabase
      .from('customers')
      .upsert(
        {
          store_id: validatedData.storeId,
          email: validatedData.email,
          full_name: validatedData.fullName,
          phone_number: validatedData.phoneNumber,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'store_id,email',
        }
      )

    if (customerError) {
      console.error('Error upserting customer:', customerError)
      // Continue - this is not critical
    }

    // Track analytics inline (like links do)
    trackLeadSubmission({
      storeId: validatedData.storeId,
      productId: validatedData.productId,
      sessionId: validatedData.sessionId,
      email: validatedData.email,
      fullName: validatedData.fullName,
      phoneNumber: validatedData.phoneNumber,
      referrer: validatedData.referrer,
      userAgent: validatedData.userAgent,
      ipHash: validatedData.ipHash,
      utm_source: validatedData.utm_source,
      utm_medium: validatedData.utm_medium,
      utm_campaign: validatedData.utm_campaign,
      utm_content: validatedData.utm_content,
      utm_term: validatedData.utm_term,
    }).catch((error) => {
      console.error('Error tracking lead submission:', error)
      // Don't fail the request if analytics fails
    })

    // Send freebie email
    const emailResult = await sendFreebieEmail({
      toEmail: validatedData.email,
      customerName: validatedData.fullName,
      storeName: product.stores.name,
      storeProfilePic: product.stores.profile_pic_url,
      freebieConfig: {
        freebieType: productConfig.freebieType,
        freebieLink: productConfig.freebieLink,
        freebieFile: productConfig.freebieFile,
      },
    })

    // Update freebie_sent status if email was sent successfully
    if (emailResult.success) {
      await supabase
        .from('lead_captures')
        .update({
          freebie_sent: true,
          freebie_sent_at: new Date().toISOString(),
        })
        .eq('id', leadCapture.id)
    }

    // Return success even if email failed (user can retry)
    return {
      success: true,
      data: {
        leadCaptureId: leadCapture.id,
        emailSent: emailResult.success,
      },
    }
  } catch (error: unknown) {
    console.error('Error in submitLeadCapture:', error)
    return handleLeadCaptureError(error, 'An unexpected error occurred. Please try again.')
  }
}

// ============================================================================
// RETRY FREEBIE EMAIL
// ============================================================================

export async function retryFreebieEmail(
  input: RetryFreebieEmailInput
): Promise<Response> {
  try {
    // Validate input
    const validatedData = retryFreebieEmailSchema.parse(input)

    const supabase = await createServerSupabaseClient()

    // Get lead capture with product and store details
    const { data: leadCapture, error: leadCaptureError } = await supabase
      .from('lead_captures')
      .select('*, products!inner(type_config, stores!inner(name, profile_pic_url))')
      .eq('id', validatedData.leadCaptureId)
      .single()

    if (leadCaptureError || !leadCapture) {
      console.error('Error fetching lead capture:', leadCaptureError)
      return {
        success: false,
        error: 'Lead capture record not found',
      }
    }

    // Ensure we have email
    if (!leadCapture.email) {
      return {
        success: false,
        error: 'No email address found for this lead',
      }
    }

    // Parse product config
    const productConfig = leadCapture.products.type_config as unknown as LeadMagnetConfig

    // Resend freebie email
    const emailResult = await sendFreebieEmail({
      toEmail: leadCapture.email,
      customerName: leadCapture.full_name || undefined,
      storeName: leadCapture.products.stores.name,
      storeProfilePic: leadCapture.products.stores.profile_pic_url,
      freebieConfig: {
        freebieType: productConfig.freebieType,
        freebieLink: productConfig.freebieLink,
        freebieFile: productConfig.freebieFile,
      },
    })

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error || 'Failed to resend email',
      }
    }

    // Update freebie_sent status
    await supabase
      .from('lead_captures')
      .update({
        freebie_sent: true,
        freebie_sent_at: new Date().toISOString(),
      })
      .eq('id', leadCapture.id)

    return { success: true }
  } catch (error: unknown) {
    console.error('Error in retryFreebieEmail:', error)
    return handleLeadCaptureError(error, 'An unexpected error occurred while retrying email.')
  }
}
