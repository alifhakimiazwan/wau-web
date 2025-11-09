'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from './resend'
import LeadMagnetFreebieEmail from '@/emails/lead-magnet-freebie'

interface SendFreebieInput {
  toEmail: string
  customerName?: string
  storeName: string
  storeProfilePic?: string | null
  freebieConfig: {
    freebieType: 'link' | 'file'
    freebieLink?: {
      url: string
      title: string
    }
    freebieFile?: {
      url: string
      filename: string
      size: number
    }
  }
}

interface SendFreebieResponse {
  success: boolean
  error?: string
  emailId?: string
}

export async function sendFreebieEmail(
  input: SendFreebieInput
): Promise<SendFreebieResponse> {
  try {
    const { toEmail, customerName, storeName, storeProfilePic, freebieConfig } = input

    let freebieUrl: string
    let freebieTitle: string

    // Handle link type
    if (freebieConfig.freebieType === 'link' && freebieConfig.freebieLink) {
      freebieUrl = freebieConfig.freebieLink.url
      freebieTitle = freebieConfig.freebieLink.title
    }
    // Handle file type - generate signed URL
    else if (freebieConfig.freebieType === 'file' && freebieConfig.freebieFile) {
      const supabase = await createServerSupabaseClient()

      // Extract file path from URL if it's a full URL
      let filePath = freebieConfig.freebieFile.url

      // If it's a full Supabase storage URL, extract the path
      // Format: https://.../storage/v1/object/public/user-uploads/path/to/file.pdf
      if (filePath.includes('/storage/v1/object/')) {
        const match = filePath.match(/\/user-uploads\/(.+)$/)
        if (match) {
          filePath = match[1]
        }
      }

      // Remove leading slash if present
      filePath = filePath.replace(/^\//, '')

      // Generate signed URL for 7 days (604800 seconds)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('user-uploads')
        .createSignedUrl(filePath, 604800)

      if (signedUrlError || !signedUrlData) {
        console.error('Error generating signed URL:', signedUrlError)
        console.error('File path attempted:', filePath)
        return {
          success: false,
          error: 'Failed to generate download link',
        }
      }

      freebieUrl = signedUrlData.signedUrl
      freebieTitle = freebieConfig.freebieFile.filename
    } else {
      return {
        success: false,
        error: 'Invalid freebie configuration',
      }
    }

    // Send email using Resend with React component
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Your freebie from ${storeName}`,
      react: LeadMagnetFreebieEmail({
        storeName,
        storeProfilePic: storeProfilePic || undefined,
        customerName,
        freebieTitle,
        freebieUrl,
        freebieType: freebieConfig.freebieType,
      }),
    })

    if (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      emailId: data?.id,
    }
  } catch (error) {
    console.error('Unexpected error sending freebie email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}
