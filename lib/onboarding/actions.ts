'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { onboardingSchema } from '@/lib/onboarding/schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { OnboardingResponse } from './types'
import { z } from 'zod'

export async function checkUsernameAvailability(
  username: string
): Promise<OnboardingResponse> {
  try {
    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' }
    }

    // Validate format
    if (!/^[a-z0-9-]+$/.test(username)) {
      return { success: false, error: 'Invalid username format' }
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', username.toLowerCase())
      .maybeSingle()

    if (error) {
      console.error('Username check error:', error)
      return { success: false, error: 'Failed to check username' }
    }

    // If data exists, username is taken
    const available = !data
    return { success: true, usernameAvailable: available }
  } catch (error) {
    console.error('Username check error:', error)
    return { success: false, error: 'Failed to check username' }
  }
}

export async function completeOnboarding(
  formData: FormData
): Promise<OnboardingResponse> {
  try {
    // Validate data
    const data = onboardingSchema.parse({
      username: formData.get('username'),
      name: formData.get('name'),
      phoneNumber: formData.get('phoneNumber') || '',
    })

    const supabase = await createServerSupabaseClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if username is available
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', data.username.toLowerCase())
      .single()

    if (existingStore) {
      return { success: false, error: 'Username is already taken' }
    }

    // Check if user already has a store
    const { data: userStore } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (userStore) {
      return { success: false, error: 'You already have a store' }
    }

    // Create store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        user_id: user.id,
        slug: data.username.toLowerCase(),
        name: data.name,
        phone_number: data.phoneNumber || null, 
      })
      .select()
      .single()

    if (storeError) {
      console.error('Store creation error:', storeError)
      return { success: false, error: 'Failed to create store' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
  } catch (error) {
    console.error('Onboarding error:', error)

    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }

    
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}