'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './use-user'
import type { Database } from '@/types/database.types'

type Store = Database['public']['Tables']['stores']['Row']
type StoreCustomization = Database['public']['Tables']['store_customization']['Row']

interface UseStoreReturn {
  store: Store | null
  customization: StoreCustomization | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useStore(): UseStoreReturn {
  const { user } = useUser()
  const [store, setStore] = useState<Store | null>(null)
  const [customization, setCustomization] = useState<StoreCustomization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = createClient()

  const fetchStore = async () => {
    if (!user) {
      setStore(null)
      setCustomization(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (storeError) throw storeError

      setStore(storeData)

      // Fetch customization
      if (storeData) {
        const { data: customizationData, error: customizationError } = await supabase
          .from('store_customization')
          .select('*')
          .eq('store_id', storeData.id)
          .single()

        if (customizationError && customizationError.code !== 'PGRST116') {
          console.error('Customization error:', customizationError)
        }

        setCustomization(customizationData)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch store'))
      setStore(null)
      setCustomization(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStore()
  }, [user?.id])

  return { store, customization, loading, error, refetch: fetchStore }
}