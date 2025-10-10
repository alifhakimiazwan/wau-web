import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database.types'

type Store = Database['public']['Tables']['stores']['Row']
type User = {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface AuthResult {
  user: User
}

interface StoreResult extends AuthResult {
  store: Store
}

/**
 * Ensures user is authenticated.
 * Redirects to /login if not.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  return { user }
}

/**
 * Ensures user has completed onboarding (has a store).
 * Redirects to /onboarding if not.
 */
export async function requireStore(): Promise<StoreResult> {
  const { user } = await requireAuth()
  const supabase = await createServerSupabaseClient()
  
  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Store fetch error:', error)
    redirect('/onboarding')
  }

  if (!store) {
    redirect('/onboarding')
  }

  return { user, store }
}

/**
 * Prevents access to onboarding if user already has a store.
 * Redirects to /dashboard if store exists.
 */
export async function preventCompletedOnboarding(): Promise<AuthResult> {
  const { user } = await requireAuth()
  const supabase = await createServerSupabaseClient()
  
  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (store) {
    redirect('/dashboard')
  }

  return { user }
}

/**
 * Optional: Get store if exists, but don't redirect.
 * Useful for pages that work with or without a store.
 */
export async function getStoreIfExists(): Promise<{
  user: User
  store: Store | null
}> {
  const { user } = await requireAuth()
  const supabase = await createServerSupabaseClient()
  
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return { user, store }
}