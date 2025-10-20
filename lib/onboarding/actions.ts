'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { onboardingSchema } from '@/lib/onboarding/schemas'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { OnboardingResponse } from './types'

export async function checkUsernameAvailability(
  username: string
): Promise<OnboardingResponse> {
  try {
    if (username.length < 3) {
      return { success: false, error: 'Username too short' }
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', username.toLowerCase())
      .single()

    if (error && error.code === 'PGRST116') {
      // Not found - username is available
      return { success: true, usernameAvailable: true }
    }

    if (data) {
      // Found - username is taken
      return { success: true, usernameAvailable: false }
    }

    return { success: true, usernameAvailable: true }
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

    if (error.name === 'ZodError') {
      return { success: false, error: error.errors[0].message }
    }

    if (error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return { success: false, error: 'An unexpected error occurred' }
  }
}