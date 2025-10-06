import { useState, useEffect } from 'react'
import { UseFormSetError, UseFormClearErrors } from 'react-hook-form'
import type { OnboardingFormData } from '@/lib/validations/onboarding'

interface UseUsernameAvailabilityProps {
  username: string
  setError: UseFormSetError<OnboardingFormData>
  clearErrors: UseFormClearErrors<OnboardingFormData>
}

interface UseUsernameAvailabilityReturn {
  isChecking: boolean
  isAvailable: boolean | null
}

export function useUsernameAvailability({
  username,
  setError,
  clearErrors,
}: UseUsernameAvailabilityProps): UseUsernameAvailabilityReturn {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    // Reset if empty or too short
    if (!username || username.length < 3) {
      setIsAvailable(null)
      return
    }

    // Validate format client-side first
    if (!/^[a-z0-9-]+$/.test(username)) {
      setIsAvailable(false)
      setError('username', {
        message: 'Only lowercase letters, numbers, and hyphens allowed',
      })
      return
    }

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      setIsChecking(true)

      try {
        const response = await fetch(
          `/api/check-username?username=${encodeURIComponent(username)}`
        )
        const data = await response.json()

        if (response.ok) {
          setIsAvailable(data.available)

          if (!data.available) {
            setError('username', { message: 'Username is already taken' })
          } else {
            clearErrors('username')
          }
        } else {
          setError('username', {
            message: data.error || 'Failed to check username',
          })
        }
      } catch (error) {
        console.error('Username check failed:', error)
        setError('username', { message: 'Failed to check username' })
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [username, setError, clearErrors])

  return { isChecking, isAvailable }
}