'use server'
import { loginSchema, signupSchema } from '../validations/auth'
import type { AuthResponse } from './types'
import { createServerSupabaseClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData): Promise<AuthResponse> {
    try {
        const data = signupSchema.parse({
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        })

        const supabase = await createServerSupabaseClient();

        const { data: authData, error: signupError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    fullName: data.fullName
                },
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
            }
        })

        if (signupError) {
            return {
                success: false,
                error: signupError.message
            }
        }
        if (authData.user) {
            if (authData.user.identities?.length === 0) {
                return {
                    success: false,
                    error: 'An account with this email already exists'
                }
            }
        return {
            success: true,
            message: 'Account created successfully'
        }
    }
    return {
        success: false,
        error: 'An error occurred while creating your account'
    }
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return {
                success: false, error: error.errors[0].message
            }
        }
        return {
            success: false, error: error.message
        }

    }
}

export async function login(formData: FormData): Promise<AuthResponse> {
    try {
      // Parse and validate
      const data = loginSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      })
  
      const supabase = await createServerSupabaseClient()
  
      // Sign in
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
  
      if (loginError) {
        // ⭐ BETTER ERROR MESSAGES
        console.error('Login error:', loginError) // Log for debugging
        
        // Map Supabase errors to user-friendly messages
        if (loginError.message === 'Invalid login credentials') {
          return { 
            success: false, 
            error: 'Invalid email and password. Please try again.' 
          }
        }
        
        if (loginError.message === 'Email not confirmed') {
          return {
            success: false,
            error: 'Please confirm your email address before logging in. Check your inbox.'
          }
        }
        
        if (loginError.message.includes('User not found')) {
          return {
            success: false,
            error: 'No account found with this email address.'
          }
        }
        
        // Generic fallback with actual error for debugging
        return { 
          success: false, 
          error: `Login failed: ${loginError.message}` 
        }
      }
  
      if (authData.user) {
        // Check if user has store
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .select('id, slug')
          .eq('user_id', authData.user.id)
          .single()
        
        // ⭐ HANDLE STORE CHECK ERROR
        if (storeError && storeError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is expected for new users
          console.error('Store check error:', storeError)
        }
  
        // Revalidate and redirect
        revalidatePath('/', 'layout')
        
        if (store) {
          redirect('/dashboard')
        } else {
          redirect('/onboarding')
        }
      }
  
      return { success: true }
    } catch (error: any) {
      // ⭐ BETTER ERROR HANDLING
      console.error('Login exception:', error)
      
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        return { 
          success: false, 
          error: error.errors[0].message 
        }
      }
      
      // Handle redirect (Next.js throws NEXT_REDIRECT)
      if (error.message === 'NEXT_REDIRECT') {
        throw error
      }
      
      // Generic error with details
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred. Please try again.' 
      }
    }
  }

export async function logout() {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  }