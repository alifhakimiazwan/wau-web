import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Store = Database['public']['Tables']['stores']['Row']
type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

type AuthResult =
  | { success: true; user: User }
  | { success: false; error: string }

type AuthWithStoreResult =
  | { success: true; user: User; store: Store }
  | { success: false; error: string }

/**
 * Non-redirecting helper: Get authenticated user
 * Returns result object suitable for Server Actions and API Routes
 *
 * @returns {AuthResult} Object with success flag, user data, or error message
 *
 * @example
 * // In Server Action
 * const authResult = await getAuthUser()
 * if (!authResult.success) {
 *   return { success: false, error: authResult.error }
 * }
 * const { user } = authResult
 *
 * @example
 * // In API Route
 * const authResult = await getAuthUser()
 * if (!authResult.success) {
 *   return NextResponse.json(
 *     { success: false, error: authResult.error },
 *     { status: 401 }
 *   )
 * }
 */
export async function getAuthUser(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  return { success: true, user }
}

/**
 * Non-redirecting helper: Get authenticated user with their store
 * Returns result object suitable for Server Actions and API Routes
 *
 * @returns {AuthWithStoreResult} Object with success flag, user data, store data, or error message
 *
 * @example
 * // In Server Action
 * const result = await getAuthUserWithStore()
 * if (!result.success) {
 *   return { success: false, error: result.error }
 * }
 * const { user, store } = result
 *
 * @example
 * // In API Route
 * const result = await getAuthUserWithStore()
 * if (!result.success) {
 *   const status = result.error?.includes('authenticated') ? 401 : 404
 *   return NextResponse.json(
 *     { success: false, error: result.error },
 *     { status }
 *   )
 * }
 */
export async function getAuthUserWithStore(): Promise<AuthWithStoreResult> {
  const authResult = await getAuthUser()
  if (!authResult.success) {
    return authResult
  }

  const supabase = await createServerSupabaseClient()
  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', authResult.user!.id)
    .maybeSingle()

  if (error) {
    console.error('Store fetch error:', error)
    return {
      success: false,
      error: 'Failed to fetch store. Please try again.'
    }
  }

  if (!store) {
    return {
      success: false,
      error: 'Store not found. Please complete onboarding first.'
    }
  }

  return { success: true, user: authResult.user!, store }
}
