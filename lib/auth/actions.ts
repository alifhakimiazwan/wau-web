'use server'
import { loginSchema, signupSchema } from '../auth/schemas'
import type { AuthResponse } from './types'
import { createServerSupabaseClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

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
            console.error('Signup error:', signupError)
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
    } catch (error) {
        console.error('Signup exception:', error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
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
  
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
  
      if (loginError) {
        console.error('Login error:', loginError) // Log for debugging
        
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
        
        if (storeError && storeError.code !== 'PGRST116') {
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
    } catch (error) {
      // Handle redirect first (Next.js throws NEXT_REDIRECT) - this is not an error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error
      }

      // Now log actual errors
      console.error('Login exception:', error)

      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.issues[0].message
        }
      }

      // Generic error with details
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
      }
    }
  }

export async function logout() {
    try {
      const supabase = await createServerSupabaseClient()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
        // Even if signOut fails, we should still clear the client-side session
        // by redirecting to login
      }

      revalidatePath('/', 'layout')
      redirect('/login')
    } catch (error) {
      // Handle redirect first (Next.js throws NEXT_REDIRECT) - this is not an error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
        throw error
      }

      // Now log actual errors
      console.error('Logout exception:', error)

      // If something goes wrong, still try to redirect to login
      // This ensures user is logged out on the client side
      redirect('/login')
    }
  }