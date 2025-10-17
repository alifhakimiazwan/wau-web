/**
 * useFormPersist Hook
 *
 * Persists form data to localStorage and restores it on mount
 * Useful for preventing data loss during accidental navigation
 */

import { useEffect, useState } from "react";

interface UseFormPersistParams<T> {
  key: string;
  defaultValues: T;
  enabled?: boolean;
}

export function useFormPersist<T>({
  key,
  defaultValues,
  enabled = true,
}: UseFormPersistParams<T>) {
  const [isRestored, setIsRestored] = useState(false);

  // Load persisted data from localStorage
  const loadPersistedData = (): T => {
    if (!enabled || typeof window === "undefined") {
      return defaultValues;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultValues, ...parsed };
      }
    } catch (error) {
      console.error("Failed to load persisted form data:", error);
    }

    return defaultValues;
  };

  // Save data to localStorage
  const persistData = (data: T) => {
    if (!enabled || typeof window === "undefined") return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to persist form data:", error);
    }
  };

  // Clear persisted data
  const clearPersistedData = () => {
    if (!enabled || typeof window === "undefined") return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear persisted form data:", error);
    }
  };

  // Mark as restored on mount
  useEffect(() => {
    setIsRestored(true);
  }, []);

  return {
    loadPersistedData,
    persistData,
    clearPersistedData,
    isRestored,
  };
}
